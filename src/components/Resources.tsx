"use client"

import { Header } from "./Header"

const Resources = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header activeItem="resources" />

      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Resources for Learning Japanese</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Introduction</h2>
          <p>
            <a
              href="https://learnjapanese.moe/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:text-violet-800 font-medium"
            >
              LearnJapanese.moe
            </a>{" "}
            (also known as The Moe Way guide) is an extensive online guide for self-learners of Japanese. It aims to
            provide a fast, efficient, and enjoyable path to learning Japanese by focusing on immersion and smart use of
            tools.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Immersion Resources</h2>
          <p>
            Immersion is a key part of learning Japanese. Here are some resources to help you immerse yourself in the
            language:
          </p>
          <ul className="list-disc list-inside">
            <li>
              <strong>Anime &amp; Manga:</strong> Watch anime and read manga in Japanese to get used to the language and
              culture.
            </li>
            <li>
              <strong>Japanese Music:</strong> Listen to Japanese music to improve your listening skills and vocabulary.
            </li>
            <li>
              <strong>Japanese YouTube Channels:</strong> Watch Japanese YouTubers to learn about Japanese culture and
              language.
            </li>
            <li>
              <strong>Japanese Books &amp; Novels:</strong> Read Japanese books and novels to improve your reading
              skills and vocabulary.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Grammar Resources</h2>
          <p>
            Understanding grammar is essential for learning Japanese. Here are some resources to help you with grammar:
          </p>
          <ul className="list-disc list-inside">
            <li>
              <strong>Tae Kim's Guide to Learning Japanese:</strong> A free online guide that covers Japanese grammar in
              detail.
            </li>
            <li>
              <strong>Genki:</strong> A popular textbook series for learning Japanese.
            </li>
            <li>
              <strong>A Dictionary of Basic Japanese Grammar:</strong> A comprehensive dictionary of Japanese grammar.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Vocabulary Resources</h2>
          <p>
            Building your vocabulary is crucial for understanding and speaking Japanese. Here are some resources to help
            you with vocabulary:
          </p>
          <ul className="list-disc list-inside">
            <li>
              <strong>Anki:</strong> A flashcard program that uses spaced repetition to help you memorize vocabulary.
            </li>
            <li>
              <strong>Memrise:</strong> A language learning platform that uses flashcards and other techniques to help
              you learn vocabulary.
            </li>
            <li>
              <strong>Jisho.org:</strong> An online Japanese dictionary.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Community Resources</h2>
          <p>
            Connecting with other learners can be a great way to stay motivated and get help with your studies. Here are
            some community resources:
          </p>
          <ul className="list-disc list-inside">
            <li>
              <strong>HelloTalk:</strong> A language exchange app that connects you with native Japanese speakers.
            </li>
            <li>
              <strong>Tandem:</strong> Another language exchange app that connects you with native Japanese speakers.
            </li>
            <li>
              <strong>Reddit:</strong> There are many subreddits dedicated to learning Japanese, such as
              r/LearnJapanese.
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export default Resources
