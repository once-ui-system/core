"use client"

import { Box, Flex, Input, Text, VisuallyHidden } from "@chakra-ui/react"
import NextLink from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { LuSearch } from "react-icons/lu"
import { InputGroup } from "@/components/ui/input-group"
import { PATIENTS, ownerById } from "@/lib/data"
import { AlertBadges } from "./AlertBadges"

export function PatientSearch() {
  const router = useRouter()
  const [q, setQ] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const listId = React.useId()

  const query = q.trim().toLowerCase()
  const results = React.useMemo(() => {
    if (!query) return []
    return PATIENTS.filter((p) => {
      const owner = ownerById(p.owner)
      return (
        p.name.toLowerCase().includes(query) ||
        (owner?.name.toLowerCase().includes(query) ?? false)
      )
    })
  }, [query])

  const close = () => {
    setOpen(false)
  }

  const go = (id: string) => {
    close()
    setQ("")
    router.push(`/patients/${id}`)
  }

  return (
    <Box
      ref={wrapRef}
      position="relative"
      w="full"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) close()
      }}
    >
      <label htmlFor={`${listId}-input`}>
        <VisuallyHidden>Search patients or owners</VisuallyHidden>
      </label>
      <InputGroup w="full" startElement={<LuSearch aria-hidden="true" />}>
        <Input
          id={`${listId}-input`}
          type="search"
          autoComplete="off"
          placeholder="Search patient or owner"
          value={q}
          bg="bg.muted"
          borderRadius="full"
          size="md"
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") close()
            if (e.key === "Enter" && results[0]) go(results[0].id)
          }}
        />
      </InputGroup>

      <div aria-live="polite" role="status">
        <VisuallyHidden>
          {query ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
        </VisuallyHidden>
      </div>

      {open && query.length > 0 && (
        <Box
          id={listId}
          position="absolute"
          top="calc(100% + 6px)"
          insetX="0"
          zIndex="popover"
          bg="bg.panel"
          borderWidth="1px"
          borderRadius="lg"
          shadow="lg"
          overflow="hidden"
          maxH="70dvh"
          overflowY="auto"
        >
          {results.length === 0 ? (
            <Text p="4" color="fg.muted" fontSize="sm">
              No patient or owner matches &ldquo;{q.trim()}&rdquo;.
            </Text>
          ) : (
            <Box as="ul" listStyleType="none" m="0" p="0">
              {results.map((p) => {
                const owner = ownerById(p.owner)
                return (
                  <li key={p.id}>
                    <Box
                      asChild
                      display="block"
                      px="4"
                      py="3"
                      minH="12"
                      borderBottomWidth="1px"
                      _hover={{ bg: "bg.muted" }}
                      _focusVisible={{ bg: "bg.muted", outline: "2px solid", outlineColor: "colorPalette.focusRing" }}
                    >
                      <NextLink href={`/patients/${p.id}`} onClick={() => {
                          close()
                          setQ("")
                        }}>
                        <Flex justify="space-between" gap="3" align="baseline" wrap="wrap">
                          <Text fontWeight="semibold">{p.name}</Text>
                          <Text fontSize="sm" color="fg.muted">
                            {p.species}, {p.breed}
                          </Text>
                        </Flex>
                        <Text fontSize="sm" color="fg.muted" mb={p.alerts.length ? "1.5" : "0"}>
                          Owner: {owner?.name}
                        </Text>
                        <AlertBadges alerts={p.alerts} size="xs" />
                      </NextLink>
                    </Box>
                  </li>
                )
              })}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
