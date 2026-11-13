"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Box, Flex, Input, Text, VisuallyHidden } from "@chakra-ui/react"
import { LuSearch } from "react-icons/lu"
import { InputGroup } from "@/components/ui/input-group"
import { AlertChips } from "@/components/Alerts"
import { PATIENTS, getOwner, type Patient } from "@/lib/data"

function matches(p: Patient, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return false
  const owner = getOwner(p.owner)
  return (
    p.name.toLowerCase().includes(needle) ||
    owner.name.toLowerCase().includes(needle) ||
    owner.phone.replace(/\s/g, "").includes(needle.replace(/\s/g, ""))
  )
}

export function PatientSearch() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const listId = React.useId()

  const results = React.useMemo(() => PATIENTS.filter((p) => matches(p, query)), [query])
  const showPanel = open && query.trim().length > 0

  const go = (id: string) => {
    setOpen(false)
    setQuery("")
    router.push(`/patients/${id}`)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setOpen(true)
      setActive((i) => (results.length === 0 ? 0 : (i + 1) % results.length))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => (results.length === 0 ? 0 : (i - 1 + results.length) % results.length))
    } else if (e.key === "Enter") {
      const hit = results[active] ?? results[0]
      if (hit) {
        e.preventDefault()
        go(hit.id)
      }
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  const optionId = (id: string) => `${listId}-${id}`
  const activePatient = results[active]

  return (
    <Box
      ref={wrapRef}
      position="relative"
      w="full"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <InputGroup
        w="full"
        startElement={<LuSearch aria-hidden />}
        endElement={
          query ? (
            <Text as="span" fontSize="xs" color="fg.muted" pe="2" display={{ base: "none", md: "inline" }}>
              {results.length} found
            </Text>
          ) : undefined
        }
      >
        <Input
          role="combobox"
          aria-label="Search patients and owners"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showPanel && activePatient ? optionId(activePatient.id) : undefined}
          placeholder="Search patient or owner"
          autoComplete="off"
          value={query}
          size="md"
          bg="bg.panel"
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </InputGroup>
      {showPanel && (
        <Box
          id={listId}
          role="listbox"
          aria-label="Matching patients"
          position="absolute"
          top="calc(100% + 6px)"
          insetInline="0"
          zIndex="dropdown"
          bg="bg.panel"
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="lg"
          maxH="22rem"
          overflowY="auto"
          p="1"
        >
          {results.length === 0 ? (
            <Text px="3" py="3" color="fg.muted" fontSize="sm">
              No patient or owner matches &ldquo;{query.trim()}&rdquo;
            </Text>
          ) : (
            results.map((p, i) => {
              const owner = getOwner(p.owner)
              return (
                <Box
                  key={p.id}
                  id={optionId(p.id)}
                  role="option"
                  aria-selected={i === active}
                  tabIndex={-1}
                  px="3"
                  py="2.5"
                  borderRadius="md"
                  cursor="pointer"
                  bg={i === active ? "bg.muted" : undefined}
                  _hover={{ bg: "bg.muted" }}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(p.id)}
                >
                  <Flex justify="space-between" align="baseline" gap="3">
                    <Text fontWeight="semibold">{p.name}</Text>
                    <Text fontSize="xs" color="fg.muted">
                      {p.species} · {p.breed}
                    </Text>
                  </Flex>
                  <Text fontSize="sm" color="fg.muted">
                    Owner: {owner.name} · {owner.phone}
                  </Text>
                  {p.alerts.length > 0 && (
                    <Box mt="1.5">
                      <AlertChips alerts={p.alerts} size="sm" />
                    </Box>
                  )}
                </Box>
              )
            })
          )}
        </Box>
      )}
      <VisuallyHidden aria-live="polite">
        {showPanel ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </VisuallyHidden>
    </Box>
  )
}
