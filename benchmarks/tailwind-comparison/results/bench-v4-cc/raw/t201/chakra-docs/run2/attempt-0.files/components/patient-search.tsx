"use client"

import { useMemo, useState } from "react"
import NextLink from "next/link"
import { Badge, Box, HStack, Input, Stack, Text } from "@chakra-ui/react"
import { LuSearch, LuTriangleAlert } from "react-icons/lu"
import { InputGroup } from "@/components/ui/input-group"
import { PATIENTS, ownerById } from "@/lib/data"

export function PatientSearch() {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return PATIENTS.filter((p) => {
      const o = ownerById(p.owner)
      return [p.name, o.name, p.breed, p.species, o.phone].some((s) => s.toLowerCase().includes(q))
    }).slice(0, 6)
  }, [query])

  const showPanel = open && query.trim().length > 0

  return (
    <Box
      position="relative"
      role="search"
      w="full"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <InputGroup w="full" startElement={<LuSearch aria-hidden="true" />}>
        <Input
          type="search"
          size="lg"
          placeholder="Find a patient or owner"
          aria-label="Search patients and owners"
          value={query}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setQuery("")
              setOpen(false)
            }
          }}
        />
      </InputGroup>
      <Text aria-live="polite" srOnly>
        {showPanel ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </Text>
      {showPanel && (
        <Box
          position="absolute"
          top="100%"
          insetX="0"
          mt="2"
          zIndex="dropdown"
          bg="bg.panel"
          borderWidth="1px"
          rounded="xl"
          shadow="lg"
          maxH="70vh"
          overflowY="auto"
          p="1"
        >
          {results.length === 0 ? (
            <Text p="3" color="fg.muted">
              No patient or owner matches “{query.trim()}”.
            </Text>
          ) : (
            <Box asChild listStyleType="none" m="0" p="0">
              <ul>
                {results.map((p) => {
                  const owner = ownerById(p.owner)
                  return (
                    <li key={p.id}>
                      <Box
                        asChild
                        display="block"
                        p="3"
                        rounded="lg"
                        minH="12"
                        _hover={{ bg: "bg.muted" }}
                        _focusVisible={{ outline: "2px solid", outlineColor: "colorPalette.focusRing" }}
                      >
                        <NextLink
                          href={`/patients/${p.id}`}
                          onClick={() => {
                            setQuery("")
                            setOpen(false)
                          }}
                        >
                          <Stack gap="1">
                            <HStack justify="space-between" gap="3">
                              <Text fontWeight="semibold">{p.name}</Text>
                              {p.alerts.length > 0 && (
                                <Badge colorPalette="red" variant="solid" size="sm">
                                  <LuTriangleAlert aria-hidden="true" />
                                  {p.alerts.length === 1 ? "1 alert" : `${p.alerts.length} alerts`}
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="sm" color="fg.muted">
                              {p.species}, {p.breed} · Owner {owner.name}
                            </Text>
                          </Stack>
                        </NextLink>
                      </Box>
                    </li>
                  )
                })}
              </ul>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
