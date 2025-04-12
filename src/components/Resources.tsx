/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { BookOpen, ExternalLink, Headphones, Home, Lightbulb, List, LogOut, Menu, Pencil, Play, Trophy } from "lucide-react"
import { Link } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../supabaseClient"
function Resources() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  useAuth()
  // Update the sectionRefs object to include the tldr section
  const [activeSection, setActiveSection] = useState<string>("tldr") // Changed default active section to tldr
  const sectionRefs = {
    tldr: useRef<HTMLDivElement>(null),
    introduction: useRef<HTMLDivElement>(null),
    principles: useRef<HTMLDivElement>(null),
    foundations: useRef<HTMLDivElement>(null),
    kana: useRef<HTMLDivElement>(null),
    vocabulary: useRef<HTMLDivElement>(null),
    grammar: useRef<HTMLDivElement>(null),
    immersion: useRef<HTMLDivElement>(null),
    tools: useRef<HTMLDivElement>(null),
    content: useRef<HTMLDivElement>(null),
    usage: useRef<HTMLDivElement>(null),
  }
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }
  // Handle smooth scrolling when clicking on TOC links
  const scrollToSection = (sectionId: string) => {
    const section = sectionRefs[sectionId as keyof typeof sectionRefs]?.current
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }
  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100 // Offset for header
      // Check each section's position and update active section
      Object.entries(sectionRefs).forEach(([id, ref]) => {
        if (ref.current) {
          const element = ref.current
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(id)
          }
        }
      })
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [sectionRefs])
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Languages className="h-8 w-8 text-violet-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">The Sanctuary</h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              <Link
                to="/leaderboard"
                className="text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Trophy className="h-4 w-4 mr-1" />
                Leaderboard
              </Link>
              <Link
                to="/resources"
                className="text-violet-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Resources
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-violet-600 p-2">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2">
            <div className="px-4 space-y-1">
              <Link
                to="/"
                className="text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <Home className="h-5 w-5 mr-2" />
                Home
              </Link>
              <Link
                to="/leaderboard"
                className="text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <Trophy className="h-5 w-5 mr-2" />
                Leaderboard
              </Link>
              <Link
                to="/resources"
                className="text-violet-600 px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Resources
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left text-gray-700 hover:text-violet-600 px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Table of Contents - Sticky Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white shadow rounded-xl overflow-hidden sticky top-24">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Table of Contents</h2>
              </div>
              {/* Add the TL;DR entry to the table of contents nav */}
              <nav className="p-4">
                <ul className="space-y-1 text-sm">
                  <li>
                    <button
                      onClick={() => scrollToSection("tldr")}
                      className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                        activeSection === "tldr"
                          ? "bg-amber-50 text-amber-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      TL;DR - Quick Start
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("introduction")}
                      className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                        activeSection === "introduction"
                          ? "bg-violet-50 text-violet-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Introduction
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("principles")}
                      className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                        activeSection === "principles"
                          ? "bg-violet-50 text-violet-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Core Principles
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("foundations")}
                      className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                        activeSection === "foundations"
                          ? "bg-violet-50 text-violet-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Essential Foundations
                    </button>
                  </li>
                  <li className="pl-4">
                    <button
                      onClick={() => scrollToSection("kana")}
                      className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                        activeSection === "kana"
                          ? "bg-pink-50 text-pink-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Kana
                    </button>
                  </li>
                  <li className="pl-4">
                    <button
                      onClick={() => scrollToSection("vocabulary")}
                      className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                        activeSection === "vocabulary"
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Vocabulary & Kanji
                    </button>
                  </li>
                  <li className="pl-4">
                    <button
                      onClick={() => scrollToSection("grammar")}
                      className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                        activeSection === "grammar"
                          ? "bg-green-50 text-green-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Grammar
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("immersion")}
                      className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                        activeSection === "immersion"
                          ? "bg-violet-50 text-violet-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Immersion
                    </button>
                  </li>
                  <li className="pl-4">
                    <button
                      onClick={() => scrollToSection("tools")}
                      className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                        activeSection === "tools"
                          ? "bg-amber-50 text-amber-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Tools
                    </button>
                  </li>
                  <li className="pl-4">
                    <button
                      onClick={() => scrollToSection("content")}
                      className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                        activeSection === "content"
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Native Content
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("usage")}
                      className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                        activeSection === "usage"
                          ? "bg-violet-50 text-violet-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Using These Resources
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white shadow rounded-xl overflow-hidden mb-6">
              <div className="px-6 py-5 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900">Japanese Learning Resources</h1>
                <p className="text-gray-600 mt-1">
                  A curated guide based on LearnJapanese.moe for efficient self-learning
                </p>
              </div>
              <div className="p-6">
                {/* Add the TL;DR section at the beginning of the main content */}
                <div className="prose max-w-none">
                  {/* TL;DR Section */}
                  <div
                    ref={sectionRefs.tldr}
                    id="tldr"
                    className="mb-8 bg-amber-50 rounded-lg p-5 border border-amber-100"
                  >
                    <h2 className="flex items-center text-xl font-semibold text-amber-700 mb-4">
                      <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                      TL;DR - The Beginner's Path
                    </h2>
                    <p className="mb-4 font-medium text-amber-800">
                      If you're just starting out and want a clear path to follow, here's what you should do:
                    </p>
                    <ol className="space-y-3">
                    <li className="flex items-start">
                        <span className="flex items-center justify-center bg-amber-200 text-amber-800 font-bold rounded-full h-6 w-6 mr-3 mt-0.5 flex-shrink-0">
                          1
                        </span>
                        <div>
                          <span className="font-semibold text-amber-900">Learn Kana (Hiragana & Katakana)</span>
                          <p className="text-amber-800 mt-1">
                            Read                      
                            <a
                                href="https://learnjapanese.moe/guide"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-violet-600 hover:text-violet-800 font-medium"
                            >
                                {" "}The Moe Way Guide
                            </a>.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="flex items-center justify-center bg-amber-200 text-amber-800 font-bold rounded-full h-6 w-6 mr-3 mt-0.5 flex-shrink-0">
                          2
                        </span>
                        <div>
                          <span className="font-semibold text-amber-900">Learn Kana (Hiragana & Katakana)</span>
                          <p className="text-amber-800 mt-1">
                            Spend 1-2 weeks mastering the basic Japanese writing systems using the DJT Kana Recognition
                            Game or similar tools.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="flex items-center justify-center bg-amber-200 text-amber-800 font-bold rounded-full h-6 w-6 mr-3 mt-0.5 flex-shrink-0">
                          3
                        </span>
                        <div>
                          <span className="font-semibold text-amber-900">Use Anki for Vocabulary & Kanji</span>
                          <p className="text-amber-800 mt-1">
                            Download Anki and the "Kaishi 1.5k" deck. Study 10-20 new cards daily to build your core
                            vocabulary.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="flex items-center justify-center bg-amber-200 text-amber-800 font-bold rounded-full h-6 w-6 mr-3 mt-0.5 flex-shrink-0">
                          4
                        </span>
                        <div>
                          <span className="font-semibold text-amber-900">Learn Grammar via YouTube</span>
                          <p className="text-amber-800 mt-1">
                            Follow structured grammar playlists like Cure Dolly's Organic Japanese or Japanese Ammo with
                            Misa. Watch 1-2 videos daily.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="flex items-center justify-center bg-amber-200 text-amber-800 font-bold rounded-full h-6 w-6 mr-3 mt-0.5 flex-shrink-0">
                          5
                        </span>
                        <div>
                          <span className="font-semibold text-amber-900">Start Immersion Early</span>
                          <p className="text-amber-800 mt-1">
                            Begin consuming simple Japanese content (anime with Japanese subtitles, easy manga) even if
                            you only understand a small percentage. Use Yomichan to look up words.
                          </p>
                        </div>
                      </li>
                    </ol>
                    <div className="mt-4 p-3 bg-white rounded-md border border-amber-200">
                      <p className="text-amber-900 font-medium">
                        <span className="text-amber-600">💡 Pro Tip:</span> Consistency beats intensity. Aim for daily
                        practice (even just 30 minutes) rather than occasional marathon sessions.
                      </p>
                    </div>
                  </div>
                  {/* Introduction Section */}
                  <div ref={sectionRefs.introduction} id="introduction">
                    <h2 className="text-xl font-semibold text-violet-700 mb-3">Introduction</h2>
                    <p>
                    <a
                        href="https://learnjapanese.moe/guide"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-600 hover:text-violet-800 font-medium"
                    >
                        LearnJapanese.moe
                    </a>{" "} (also known as The Moe Way guide) is an extensive online guide for self-learners
                      of Japanese. It aims to provide a fast, efficient, and enjoyable path to learning Japanese by
                      focusing on immersion and smart use of tools. You should read the entire guide, but I've condensed
                      it here for convenience.
                    </p>
                  </div>
                  {/* Core Principles Section */}
                  <div
                    ref={sectionRefs.principles}
                    id="principles"
                    className="mt-8 bg-violet-50 rounded-lg p-5 border border-violet-100"
                  >
                    <h2 className="flex items-center text-xl font-semibold text-violet-700 mb-4">
                      <Lightbulb className="h-5 w-5 mr-2 text-violet-500" />
                      Core Principles
                    </h2>
                    <ul className="space-y-4">
                      <li className="flex">
                        <span className="font-semibold text-violet-700 mr-2">Immersion from Early On:</span>
                        <span>
                          True fluency comes from exposure to native content. Instead of relying solely on textbooks or
                          apps, learners should read and listen to real Japanese as soon as possible.
                        </span>
                      </li>
                      <li className="flex">
                        <span className="font-semibold text-violet-700 mr-2">Top-Down Learning:</span>
                        <span>
                          You won't understand everything at the start, and that's okay. Dive into content and pick up
                          understanding gradually, rather than trying to master every detail first.
                        </span>
                      </li>
                      <li className="flex">
                        <span className="font-semibold text-violet-700 mr-2">"Don't Fear Sucking":</span>
                        <span>
                          Many beginners are perfectionists who fear making mistakes. Struggling is a natural part of
                          the process. Accept that you will "suck" at first and improve through practice.
                        </span>
                      </li>
                      <li className="flex">
                        <span className="font-semibold text-violet-700 mr-2">Optimize with Tools:</span>
                        <span>
                          While immersion is central, effective study tools provide support. Spaced repetition
                          flashcards, targeted grammar resources, and quick lookup tools help you learn faster.
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Essential Foundations Section */}
                  <div ref={sectionRefs.foundations} id="foundations">
                    <h2 className="text-xl font-semibold text-violet-700 mt-8 mb-4">Essential Foundations</h2>
                  </div>

                  {/* Kana Section */}
                  <div
                    ref={sectionRefs.kana}
                    id="kana"
                    className="mb-6 border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-pink-50 px-5 py-3 border-b border-pink-100">
                      <h3 className="flex items-center text-lg font-semibold text-pink-700">
                        <Pencil className="h-5 w-5 mr-2 text-pink-500" />
                        Kana (Hiragana & Katakana)
                      </h3>
                    </div>
                    <div className="p-5">
                      <p className="mb-4">
                        Learning the basic Japanese writing systems (hiragana and katakana) is your first step. These
                        phonetic scripts are essential before moving to kanji.
                      </p>
                      <div className="space-y-3">
                        <div className="bg-white border border-gray-100 rounded-md p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900">Tae Kim's "Writing System" Page</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            An introduction to Japanese kana explaining what they are, how they're used, and why you
                            need them.
                          </p>
                          <a
                            href="https://gohoneko.neocities.org/grammar/taekim.html#6%20The%20Scripts"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-sm font-medium text-violet-600 hover:text-violet-800"
                          >
                            Visit Resource <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-md p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900">DJT Kana Recognition Game</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            A simple web game for drilling hiragana and katakana. Practice until you can readily
                            recognize all kana.
                          </p>
                          <a
                            href="https://djtguide.neocities.org/kana/index.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-sm font-medium text-violet-600 hover:text-violet-800"
                          >
                            Visit Resource <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

          {/* Vocabulary & Kanji Section */}
                  <div        
                    ref={sectionRefs.vocabulary}
                    id="vocabulary"
                    className="mb-6 border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-blue-50 px-5 py-3 border-b border-blue-100">
                      <h3 className="flex items-center text-lg font-semibold text-blue-700">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                        Basic Vocabulary & Kanji
                      </h3>
                    </div>
                    <div className="p-5">
                      <p className="mb-4">
                        Build your core vocabulary and learn kanji through context rather than isolated study.
                      </p>
                      <div className="space-y-3">
                        <div className="bg-white border border-gray-100 rounded-md p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900">Anki - Spaced Repetition Flashcards</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            A free flashcard program that uses spaced repetition to help you memorize words efficiently.
                            Available on PC/Mac/Linux and Android.
                          </p>
                          <a
                            href="https://apps.ankiweb.net/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-sm font-medium text-violet-600 hover:text-violet-800"
                          >
                            Visit Resource <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-md p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900">"Kaishi 1.5k" Starter Vocabulary Deck</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            A curated Anki deck of ~1,500 basic Japanese words (with kanji) specifically recommended for
                            beginners.
                          </p>
                          <a
                            href="https://learnjapanese.moe/resources/#:~:text=make%20use%20of.-,Kanji,in%20terms%20of%20visual%20novel%20frequency.%20Got%20absorbed%20into%20Kaishi%201.5k.,-Grammar"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-sm font-medium text-violet-600 hover:text-violet-800"
                          >
                            Visit Resource <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grammar Section */}
                  <div
                    ref={sectionRefs.grammar}
                    id="grammar"
                    className="mb-6 border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-green-50 px-5 py-3 border-b border-green-100">
                      <h3 className="flex items-center text-lg font-semibold text-green-700">
                        <List className="h-5 w-5 mr-2 text-green-500" />
                        Grammar
                      </h3>
                    </div>
                    <div className="p-5">
                      <p className="mb-4">
                        Understanding Japanese sentence structure and common grammar patterns is essential for
                        comprehension.
                      </p>
                      <div className="space-y-3">
                        <div className="bg-white border border-gray-100 rounded-md p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900">Cure Dolly's Organic Japanese</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            A unique, intuitive approach to Japanese grammar that "sticks true to the roots of the
                            language". English subtitles are available.
                          </p>
                          <a
                            href="https://www.youtube.com/playlist?list=PLg9uYxuZf8x_A-vcqqyOFZu06WlhnypWj"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-sm font-medium text-violet-600 hover:text-violet-800"
                          >
                            Visit Resource <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-md p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900">Japanese Ammo with Misa</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Clear, contextual grammar lessons that cover Japanese grammar in an engaging and detail-rich
                            way.
                          </p>
                          <a
                            href="https://www.youtube.com/playlist?list=PLd5-Wp_4tLqYZxS5j3g6kbeOfVXlTkr3N"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-sm font-medium text-violet-600 hover:text-violet-800"
                          >
                            Visit Resource <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-md p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900">Tae Kim's Grammar Guide</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            A classic resource that covers grammar from beginner to mid-intermediate in a textbook-like
                            web format.
                          </p>
                          <a
                            href="https://gohoneko.neocities.org/grammar/taekim.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-sm font-medium text-violet-600 hover:text-violet-800"
                          >
                            Visit Resource <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Immersion Tools & Media Section */}
                  <div ref={sectionRefs.immersion} id="immersion">
                    <h2 className="text-xl font-semibold text-violet-700 mt-8 mb-4">
                      Immersion: Tools & Media Resources
                    </h2>
                    <p className="mb-4">
                      Once you have the basics, the bulk of your learning will come from immersion – consuming Japanese
                      media that interests you. Start with easy, high-repetition content so you can catch common words
                      and phrases.
                    </p>
                  </div>

                  {/* Tools Section */}
                  <div
                    ref={sectionRefs.tools}
                    id="tools"
                    className="mb-6 border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-amber-50 px-5 py-3 border-b border-amber-100">
                      <h3 className="flex items-center text-lg font-semibold text-amber-700">
                        <Play className="h-5 w-5 mr-2 text-amber-500" />
                        Tools for Immersion
                      </h3>
                    </div>
                    <div className="p-5">
                      <div className="space-y-3">
                        <div className="bg-white border border-gray-100 rounded-md p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900">Yomichan (Browser Dictionary Extension)</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            "You MUST have this. It is extremely useful for reading." A free add-on for Chrome/Firefox
                            that lets you hover over Japanese text to instantly see definitions and readings.
                          </p>
                          <a
                            href="https://foosoft.net/projects/yomichan/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-sm font-medium text-violet-600 hover:text-violet-800"
                          >
                            Visit Resource <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-md p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900">Anki (for Mining Vocabulary)</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            As you encounter new words in anime or books, you can add them to Anki ("sentence mining").
                            Yomichan can be configured to create flashcards with one click.
                          </p>
                          <a
                            href="https://apps.ankiweb.net/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-sm font-medium text-violet-600 hover:text-violet-800"
                          >
                            Visit Resource <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Media Resources Section */}
                  <div
                    ref={sectionRefs.content}
                    id="content"
                    className="mb-6 border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-purple-50 px-5 py-3 border-b border-purple-100">
                      <h3 className="flex items-center text-lg font-semibold text-purple-700">
                        <Headphones className="h-5 w-5 mr-2 text-purple-500" />
                        Native Content
                      </h3>
                    </div>
                    <div className="p-5">
                      <h4 className="font-medium text-gray-900 mb-2">Anime (Japanese Cartoons)</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Anime is a fun immersion tool for listening practice. Get shows in Japanese audio (and if
                        possible, Japanese subtitles) so you can both listen and read along.
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 mb-4">
                        <li>
                          <strong>Animelon</strong> – A streaming site that provides Japanese subtitles for anime.
                        </li>
                        <li>
                          <strong>Crunchyroll (Free tier)</strong> – A legal anime streaming platform with Japanese
                          audio.
                        </li>
                        <li>
                          <strong>Nyaa.si</strong> – A torrent site for raw Japanese media.
                        </li>
                      </ul>

                      <h4 className="font-medium text-gray-900 mb-2">Manga (Japanese Comics) and Books</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        For reading practice, manga can be more approachable than novels since the images help with
                        context and the language is often conversational.
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                        <li>
                          <strong>Bilingual Manga</strong> – Japanese manga scans side by side with translations and
                          built-in dictionary support.
                        </li>
                        <li>
                          <strong>Online Manga Readers</strong> – Sites like Klmanga, MangaReader.to, or Rawkuma for raw
                          Japanese manga.
                        </li>
                        <li>
                          <strong>Digital Libraries</strong> – Community archives for Japanese ebooks and manga.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* How to Use Section */}
                  <div
                    ref={sectionRefs.usage}
                    id="usage"
                    className="mt-8 bg-gray-50 rounded-lg p-5 border border-gray-200"
                  >
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Using These Resources</h2>
                    <p className="mb-3">
                      As a self-learner, you can follow the general sequence the LearnJapanese.moe guide proposes:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>
                        <strong>Learn Kana</strong> – use the recommended kana chart/game until you know hiragana and
                        katakana cold.
                      </li>
                      <li>
                        <strong>Core Study Phase</strong> – alongside immersion, do daily Anki with the starter deck for
                        vocab/kanji and follow a grammar resource.
                      </li>
                      <li>
                        <strong>Start Immersion Early</strong> – begin watching easy shows or reading very simple
                        Japanese content (even if you only catch 10-20% at first).
                      </li>
                      <li>
                        <strong>Iterate</strong> – as you consume more Japanese media, add new words to Anki, refer to
                        grammar references when needed, and gradually step up the difficulty.
                      </li>
                    </ol>
                    <p className="mt-3 text-gray-600 italic">
                      Remember: the journey is long but rewarding. The LearnJapanese.moe guide's approach is all about
                      enjoying native content while you learn. Happy learning, and ようこそ (welcome) to the Moe Way of
                      learning Japanese!
                    </p>
                  </div>

                  <div className="mt-8 text-sm text-gray-500">
                    <p>
                      Sources: The information above is summarized from the LearnJapanese.moe guide and resources page,
                      which compile community-recommended tools and materials for learning Japanese. All listed
                      resources are free to use.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
// Add missing icon components
function Languages(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
      </svg>
    )
  }
export default Resources