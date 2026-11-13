import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuArrowLeft } from "react-icons/lu";
import { SiteHeader } from "@/components/site-header";
import { MemberAvatar } from "@/components/members/member-avatar";
import { RoleBadge, StatusBadge } from "@/components/members/member-badges";
import {
  ROLE_DESCRIPTIONS,
  formatDate,
  getActivity,
  getMember,
  members,
} from "@/lib/data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return members.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const member = getMember(id);
  return { title: member ? `${member.name} · Lumen` : "Member not found · Lumen" };
}

function ProfileRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text as="dt" fontSize="sm" color="fg.muted" mb="1">
        {label}
      </Text>
      <Box as="dd" m="0">
        {children}
      </Box>
    </Box>
  );
}

export default async function MemberPage({ params }: PageProps) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = getActivity(member.id);

  return (
    <Box minH="100vh" bg="bg.subtle">
      <SiteHeader maxW="4xl" />

      <Container as="main" maxW="4xl" py={{ base: "6", md: "10" }}>
        <Stack gap="6">
          <Link asChild alignSelf="flex-start" colorPalette="blue">
            <NextLink href="/">
              <LuArrowLeft />
              Back to team
            </NextLink>
          </Link>

          <Flex
            bg="bg"
            borderWidth="1px"
            rounded="lg"
            p={{ base: "5", md: "6" }}
            gap="5"
            direction={{ base: "column", sm: "row" }}
            align={{ base: "flex-start", sm: "center" }}
          >
            <MemberAvatar name={member.name} size="xl" />
            <Stack gap="2">
              <Heading as="h1" size="2xl">
                {member.name}
              </Heading>
              <Text color="fg.muted" wordBreak="break-all">
                {member.email}
              </Text>
              <HStack gap="2">
                <RoleBadge role={member.role} />
                <StatusBadge status={member.status} />
              </HStack>
            </Stack>
          </Flex>

          <Flex gap="6" direction={{ base: "column", md: "row" }} align="stretch">
            <Box
              as="section"
              aria-labelledby="profile-heading"
              bg="bg"
              borderWidth="1px"
              rounded="lg"
              p={{ base: "5", md: "6" }}
              flex="1"
            >
              <Heading as="h2" id="profile-heading" size="md" mb="4">
                Profile
              </Heading>
              <Stack as="dl" gap="4" m="0">
                <ProfileRow label="Role">
                  <Text>{member.role}</Text>
                  <Text fontSize="sm" color="fg.muted">
                    {ROLE_DESCRIPTIONS[member.role]}
                  </Text>
                </ProfileRow>
                <ProfileRow label="Status">
                  <Text>{member.status}</Text>
                </ProfileRow>
                <ProfileRow label="Joined">
                  <Text>
                    {member.joined ? formatDate(member.joined) : "Invitation pending"}
                  </Text>
                </ProfileRow>
              </Stack>
            </Box>

            <Box
              as="section"
              aria-labelledby="activity-heading"
              bg="bg"
              borderWidth="1px"
              rounded="lg"
              p={{ base: "5", md: "6" }}
              flex="1.4"
            >
              <Heading as="h2" id="activity-heading" size="md" mb="4">
                Recent activity
              </Heading>
              {activity.length === 0 ? (
                <Text color="fg.muted">
                  No activity yet. Activity will appear here once {member.name} joins the workspace.
                </Text>
              ) : (
                <Stack as="ul" gap="4" listStyleType="none" m="0" p="0">
                  {activity.map((item) => (
                    <Box
                      as="li"
                      key={item.id}
                      borderStartWidth="2px"
                      borderColor="border.emphasized"
                      ps="4"
                    >
                      <Text>{item.text}</Text>
                      <Text fontSize="sm" color="fg.muted">
                        {item.when}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Flex>
        </Stack>
      </Container>
    </Box>
  );
}
