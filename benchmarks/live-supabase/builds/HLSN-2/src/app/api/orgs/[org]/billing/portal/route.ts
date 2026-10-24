/** Not part of this app: the route answers 404. */
function gone() {
  return Response.json({ error: { code: "not_found", message: "Not found" } }, { status: 404 });
}

export { gone as GET, gone as POST, gone as PATCH, gone as PUT, gone as DELETE };
