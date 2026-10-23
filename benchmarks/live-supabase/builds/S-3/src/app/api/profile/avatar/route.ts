import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { isSupabaseConfigured, supabaseSecretKey } from "@/lib/sb/config";
import { requireUserAndService } from "@/lib/sb/service";
import { ApiError, errorResponse, handleApiError } from "@/lib/errors";

export const runtime = "nodejs"; // Required to safely use the service role key
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !supabaseSecretKey()) {
    return errorResponse(503, "not_configured", "Supabase is not configured. See .env.example.");
  }
  try {
    const { user, serviceClient } = await requireUserAndService();

    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      throw new ApiError(400, "invalid_file", "Invalid request: expected a file field named 'file'");
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectPath = `${user.id}/avatar/${Date.now()}-${safeName}`;

    // Convert the uploaded File (web) to a Buffer for Node.js runtime compatibility
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to storage bucket 'profiles'
    const { error: uploadError } = await serviceClient.storage
      .from("profiles")
      .upload(objectPath, buffer, {
        cacheControl: "3600",
        upsert: true, // allow overwriting the same name if it occurs
        contentType:
          file.type ||
          (fileExt === "png"
            ? "image/png"
            : fileExt === "jpg" || fileExt === "jpeg"
              ? "image/jpeg"
              : undefined),
      });

    if (uploadError) {
      throw new ApiError(500, "upload_failed", `Failed to upload avatar: ${uploadError.message}`);
    }

    // If bucket is public, we can compute a public URL. Otherwise, you may want to create signed URLs.
    const { data: publicUrlData } = serviceClient.storage.from("profiles").getPublicUrl(objectPath);
    const avatarUrl = publicUrlData.publicUrl;

    // Update profile row
    const { data: updated, error: updateError } = await serviceClient
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id)
      .select("avatar_url, username, bio")
      .single();

    if (updateError) {
      throw new ApiError(
        500,
        "profile_update_failed",
        `Failed to update profile with avatar: ${updateError.message}`,
      );
    }

    return NextResponse.json(
      { profile: updated, avatar_url: avatarUrl, path: objectPath },
      { status: 200 },
    );
  } catch (err) {
    return handleApiError(err);
  }
}
