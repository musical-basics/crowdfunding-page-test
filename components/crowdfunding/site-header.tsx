"use client"

import { useState } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Image from "next/image"

interface SiteHeaderProps {
    onTabChange: (tab: string) => void
}

export function SiteHeader({ onTabChange }: SiteHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="w-full border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Left: Logo (Home Link) */}
                <div className="flex items-center">
                    <button
                        onClick={() => onTabChange("campaign")}
                        className="flex items-center gap-2"
                    >
                        <Image
                            src="/images/DP update_DP outline black2.png"
                            alt="DreamPlay"
                            width={150}
                            height={40}
                            className="h-8 w-auto object-contain"
                            priority
                        />
                    </button>
                </div>

                {/* Center: Navigation Links (Desktop) */}
                <nav className="hidden md:flex items-center">
                    <div className="flex items-center gap-1 backdrop-blur-xl bg-white/5 border border-white/10 rounded-full px-4 py-1">
                        <Link
                            href="https://dreamplaypianos.com/"
                            className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-full hover:bg-white/5"
                        >
                            DreamPlay One
                        </Link>
                        <div className="w-px h-4 bg-white/20" />
                        <Link
                            href="https://dreamplaypianos.com/why-narrow"
                            className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-full hover:bg-white/5"
                        >
                            Why Narrow?
                        </Link>
                        <div className="w-px h-4 bg-white/20" />
                        <Link
                            href="https://dreamplaypianos.com/how-it-works"
                            className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-full hover:bg-white/5"
                        >
                            How It Works
                        </Link>
                        <div className="w-px h-4 bg-white/20" />

                        {/* About Us Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-full hover:bg-white/5 outline-none">
                                About Us
                                <ChevronDown className="w-3 h-3 transition-transform duration-200" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48 bg-white border-gray-200">
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="https://dreamplaypianos.com/our-story"
                                        className="w-full cursor-pointer text-gray-700 hover:text-gray-900"
                                    >
                                        Our Story
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="https://dreamplaypianos.com/about-us/ds-standard"
                                        className="w-full cursor-pointer text-gray-700 hover:text-gray-900"
                                    >
                                        The DS Standard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="https://blog.dreamplaypianos.com/blog"
                                        className="w-full cursor-pointer text-gray-700 hover:text-gray-900"
                                    >
                                        Our Blog
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="w-px h-4 bg-white/20" />

                        {/* Information & Policies Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-full hover:bg-white/5 outline-none">
                                Info & Policies
                                <ChevronDown className="w-3 h-3 transition-transform duration-200" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48 bg-white border-gray-200" align="end">
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="https://dreamplaypianos.com/information-and-policies/faq"
                                        className="w-full cursor-pointer text-gray-700 hover:text-gray-900"
                                    >
                                        FAQ
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="https://dreamplaypianos.com/information-and-policies/shipping"
                                        className="w-full cursor-pointer text-gray-700 hover:text-gray-900"
                                    >
                                        Shipping
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </nav>

                {/* Right: CTA + Mobile Menu */}
                <div className="flex items-center gap-4">
                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center">
                        <Button
                            onClick={() => onTabChange("rewards")}
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
                        >
                            Pre-order now
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex md:hidden">
                        <button
                            type="button"
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-muted-foreground"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background absolute left-0 right-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                    <div className="space-y-1 px-4 py-6">
                        <Link
                            href="https://dreamplaypianos.com/"
                            className="block py-2 text-base font-semibold text-foreground hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            DreamPlay One
                        </Link>
                        <Link
                            href="https://dreamplaypianos.com/why-narrow"
                            className="block py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Why Narrow?
                        </Link>
                        <Link
                            href="https://dreamplaypianos.com/how-it-works"
                            className="block py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            How It Works
                        </Link>

                        <div className="my-4 h-px bg-border" />

                        <div className="px-0 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            About Us
                        </div>
                        <Link
                            href="https://dreamplaypianos.com/our-story"
                            className="block py-2 pl-4 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Our Story
                        </Link>
                        <Link
                            href="https://dreamplaypianos.com/about-us/ds-standard"
                            className="block py-2 pl-4 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            The DS Standard
                        </Link>
                        <Link
                            href="https://blog.dreamplaypianos.com/blog"
                            className="block py-2 pl-4 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Our Blog
                        </Link>

                        <div className="my-4 h-px bg-border" />

                        <div className="px-0 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Information & Policies
                        </div>
                        <Link
                            href="https://dreamplaypianos.com/information-and-policies/faq"
                            className="block py-2 pl-4 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            FAQ
                        </Link>
                        <Link
                            href="https://dreamplaypianos.com/information-and-policies/shipping"
                            className="block py-2 pl-4 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Shipping
                        </Link>

                        <div className="mt-8 pt-4 border-t border-border">
                            <Button onClick={() => { onTabChange("rewards"); setMobileMenuOpen(false); }} className="w-full rounded-full py-6 text-lg">
                                Pre-order now
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
