"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSprayPlacements } from "@/lib/sprays";

export default function ContactUsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const pageSeed = 'contact'.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      // Check rate limit
      const hasSubmitted = document.cookie.split('; ').find(row => row.startsWith('contact-submitted='));
      if (hasSubmitted) {
        throw new Error("You can only submit one message every 12 hours. Please try again later.");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("description", formData.message);

      const response = await fetch("/api/custom-request", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
      
      // Set rate limit cookie (12 hours)
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 12);
      document.cookie = `contact-submitted=true; expires=${expiryDate.toUTCString()}; path=/`;
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Background spray patterns */}
      {isMounted && getSprayPlacements(8, pageSeed).map((spray, i) => (
        <img
          key={i}
          src={spray.src}
          alt=""
          className="fixed pointer-events-none z-0"
          style={{
            ...spray.pos,
            width: spray.size,
            height: 'auto',
            opacity: spray.opacity * 0.2,
            transform: `rotate(${spray.rotation}deg) scale(${spray.scale})`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Back link */}
        <Link
          href="/?shop=1"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Shop
        </Link>

        {/* Header */}
        <div className="mb-12 relative z-10">
          <Image
            src="/FP_Borderless.png"
            alt="Frathouse Picasso"
            width={200}
            height={67}
            className="w-[180px] h-auto mb-6"
          />
          <h1 className="font-[family-name:var(--font-body)] font-bold text-4xl md:text-5xl mb-4">
            CONTACT US
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-2xl">
            We are open to negotiation. All messages will be sent by carrier pigeon.
          </p>
        </div>

        {/* Success Screen */}
        {submitStatus === "success" && (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-green-700 bg-green-950/30 mb-8">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-body)] font-bold text-white text-2xl md:text-3xl mb-4">
              Your Picasso is in production.
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed max-w-xl mx-auto">
              Keep an eye on your inbox for updates and next steps.
            </p>
            <button
              onClick={() => setSubmitStatus("idle")}
              className="mt-10 inline-block border border-[#333] hover:border-white text-white font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase px-6 py-3 rounded-md transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={`space-y-6 ${submitStatus === "success" ? "hidden" : ""}`}>
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-[family-name:var(--font-body)] font-bold uppercase tracking-wider mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-[family-name:var(--font-body)] font-bold uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Your Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-[family-name:var(--font-body)] font-bold uppercase tracking-wider mb-2">
              Your Message
            </label>
            <textarea
              id="message"
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={6}
              className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors resize-none"
              placeholder="Tell us what's on your mind..."
            />
          </div>

          {/* Error Message */}
          {submitStatus === "error" && (
            <div className="rounded-md border border-red-800 bg-red-950/30 px-4 py-3">
              <p className="text-sm text-red-400">
                ✗ {errorMessage || "Failed to submit request. Please try again."}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 text-white font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase py-4 rounded-md transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isSubmitting ? "Sending..." : "Submit Request"}
          </button>
        </form>
      </div>
    </main>
  );
}
