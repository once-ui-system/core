"use client"

import { Link, type LinkProps } from "@chakra-ui/react"
import NextLink from "next/link"

interface TextLinkProps extends Omit<LinkProps, "href"> {
  href: string
}

/** A brand-coloured in-text link that navigates with the Next.js router. */
export function TextLink({ href, children, ...rest }: TextLinkProps) {
  return (
    <Link asChild color="brand.fg" fontWeight="medium" {...rest}>
      <NextLink href={href}>{children}</NextLink>
    </Link>
  )
}
