"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";

const changelogItems = [
  {
    title: "Landing Page Improvements",
    description:
      "We’ve redesigned the landing page to better showcase what our platform can do. Cleaner layout, clearer messaging, and an overall smoother experience for new users.",
    image: "/images/landing-page.png",
    alt: "Landing Page",
    date: "2025-04-21",
  },
  {
    title: "Dashboard Enhancements",
    description:
      "The dashboard just got smarter. Improved data visibility, faster navigation, and a more intuitive layout — all designed to help you manage your events more efficiently.",
    image: "/images/dashboard.png",
    alt: "Dashboard",
    date: "2025-04-27",
  },
  {
    title: "Invite Code Functionality [BETA]",
    description:
      "Generate codes for easy check-in and sharing. A faster, more secure way to get your guests where they need to be.",
    image: "/images/qr-code.png",
    alt: "Code Feature",
    date: "2025-05-03",
  },
];

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function Changelog() {
  return (
    <div className="w-full">
      <Navbar />

      <main className="min-h-screen pt-24 bg-black/90 text-white px-6 pb-20">
        <section className="max-w-6xl mx-auto text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-extrabold mb-4 text-white tracking-tight"
          >
            🚀 Changelog & Feature Updates
          </motion.h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Stay up to date with the latest features, performance enhancements, and UI updates.
          </p>
        </section>

        <section className="max-w-6xl mx-auto grid gap-20">
          {changelogItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="grid md:grid-cols-2 items-center gap-12 group"
            >
              {index % 2 === 0 ? (
        
                <>
                  <div className="flex justify-start">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      width={600}
                      height={400}
                      className="rounded-xl shadow-xl transition-transform group-hover:scale-[1.02]"
                    />
                  </div>

                  <div className="flex justify-end">
                    <div>
                      <p className="text-xs uppercase text-zinc-500 mb-2 tracking-wide">
                        {formatDate(item.date)}
                      </p>
                      <h2 className="text-3xl font-semibold text-white mb-3">
                        {item.title}
                      </h2>
                      <p className="text-zinc-400 leading-relaxed text-md">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
              
                <>
                  <div className="flex justify-end">
                    <div>
                      <p className="text-xs uppercase text-zinc-500 mb-2 tracking-wide">
                        {formatDate(item.date)}
                      </p>
                      <h2 className="text-3xl font-semibold text-white mb-3">
                        {item.title}
                      </h2>
                      <p className="text-zinc-400 leading-relaxed text-md">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      width={600}
                      height={400}
                      className="rounded-xl shadow-xl transition-transform group-hover:scale-[1.02]"
                    />
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
