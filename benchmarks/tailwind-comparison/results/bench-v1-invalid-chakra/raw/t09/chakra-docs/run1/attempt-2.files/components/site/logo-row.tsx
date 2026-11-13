import { Box, Container, Flex, Text } from "@chakra-ui/react"
import { logos } from "@/lib/data"

export function LogoRow() {
  return (
    <Box as="section" aria-labelledby="logos-title" py="12">
      <Container maxW="6xl">
        <Text
          id="logos-title"
          textAlign="center"
          fontSize="sm"
          color="fg.muted"
          mb="6"
        >
          Trusted by small teams who ship every week
        </Text>
        <Flex
          as="ul"
          listStyleType="none"
          m="0"
          p="0"
          wrap="wrap"
          justify="center"
          columnGap={{ base: "6", md: "12" }}
          rowGap="4"
        >
          {logos.map((name) => (
            <Box
              as="li"
              key={name}
              fontFamily="heading"
              fontSize={{ base: "lg", md: "2xl" }}
              fontWeight="bold"
              letterSpacing="tight"
              color="fg.subtle"
            >
              {name}
            </Box>
          ))}
        </Flex>
      </Container>
    </Box>
  )
}
