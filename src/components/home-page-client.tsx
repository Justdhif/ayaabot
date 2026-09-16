"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Heart,
  Image as ImageIcon,
  Wallet,
  Gift,
  HelpCircle,
  ShieldCheck,
  Zap,
  Clock,
  Mail,
  Flower2,
  BadgeCheck,
  ExternalLink,
  Code2,
  MessageCircle,
  Palette,
  RefreshCw,
  History,
  Send,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HomePageClient() {
  return (
    <main className="pb-20 relative z-10">
      {/* 🌸 NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-pink-50/80 border-b border-pink-200/60">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-pink-500 shadow-md shadow-pink-500/20">
              <Image
                src="/avatar.jpeg"
                alt="Ayaa Bot Avatar"
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl text-pink-950 tracking-tight">
                Ayaa Bot
              </span>
              <Flower2 className="w-4 h-4 text-pink-500" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="online" className="px-3.5 py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online • Private Bot</span>
            </Badge>
          </div>
        </div>
      </header>

      {/* 🎀 HERO SECTION */}
      <section className="pt-8 pb-10">
        <div className="max-w-5xl mx-auto px-6">
          <Card className="p-0 overflow-hidden text-center pb-9">
            {/* Banner Header */}
            <div className="w-full relative h-48 sm:h-72 md:h-80 overflow-hidden bg-pink-100">
              <Image
                src="/banner.png"
                alt="Ayaa Bot Cute Banner"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>

            {/* Profile Avatar overlapping */}
            <div className="-mt-16 sm:-mt-20 inline-block relative">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl shadow-pink-500/30 bg-pink-50">
                <Image
                  src="/avatar.jpeg"
                  alt="Ayaa Bot Cute Avatar"
                  fill
                  priority
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <span className="absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow-md shadow-pink-500/20">
                <Sparkles className="w-4 h-4 text-pink-500" />
              </span>
            </div>

            {/* Title & Tagline */}
            <div className="px-6 mt-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge variant="pink">
                  <Flower2 className="w-3.5 h-3.5 text-pink-600" />
                  <span>Official Landing Page</span>
                </Badge>
                <Badge variant="pink">
                  <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                  <span>v1.2.0 (Social &amp; Economy)</span>
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-pink-950 mb-3 tracking-tight flex items-center justify-center gap-2.5">
                <span>Ayaa Bot</span>
                <Heart className="w-8 h-8 text-pink-500 fill-pink-400 inline" />
              </h1>

              <p className="text-base sm:text-lg text-pink-800/90 max-w-2xl mx-auto font-semibold leading-relaxed">
                Teman AI gemas untuk bikin fotomu{" "}
                <strong className="text-pink-950 font-extrabold">2× lebih jernih, tajam &amp; HD</strong>{" "}
                langsung dari Discord, dilengkapi sistem virtual economy yang manis dan aman!
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* 🌟 STATS & HIGHLIGHTS */}
      <section className="pb-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-pink-100/70 rounded-2xl flex items-center justify-center text-pink-500">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-pink-900">
                2× HD Upscaling
              </h3>
              <p className="text-xs sm:text-sm text-pink-700/90 font-medium mt-1">
                Algoritma Lanczos3 tajam &amp; jernih
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-pink-100/70 rounded-2xl flex items-center justify-center text-pink-500">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-pink-900">
                Sweet Economy
              </h3>
              <p className="text-xs sm:text-sm text-pink-700/90 font-medium mt-1">
                Uang jajan harian &amp; tiket limit gratis
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-pink-100/70 rounded-2xl flex items-center justify-center text-pink-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-pink-900">
                100% Anti-Rugi
              </h3>
              <p className="text-xs sm:text-sm text-pink-700/90 font-medium mt-1">
                Saldo aman, hanya dipotong saat sukses
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-pink-100/70 rounded-2xl flex items-center justify-center text-pink-500">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-pink-900">
                Serverless 24/7
              </h3>
              <p className="text-xs sm:text-sm text-pink-700/90 font-medium mt-1">
                Aktif cepat di Vercel &amp; Neon DB
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 🎮 COMMANDS SHOWCASE */}
      <section id="commands" className="pb-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-8">
            <Badge variant="pink" className="mb-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span>Fitur Slash Commands</span>
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-pink-950 mt-1">
              Daftar Perintah di Discord
            </h2>
            <p className="text-sm sm:text-base text-pink-800/90 font-semibold mt-1">
              Cukup ketik perintah di bawah ini di server Discord tempat Ayaa Bot berada:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Command 1: /hd */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-pink-600 text-white px-3.5 py-1.5 rounded-xl font-extrabold text-sm font-mono flex items-center gap-1.5 shadow-sm shadow-pink-600/30">
                  <ImageIcon className="w-4 h-4" /> /hd [image] (scale) (mode)
                </span>
                <Badge variant="pink">2×: 100 💰 • 4×: 200 💰</Badge>
              </div>
              <h3 className="font-extrabold text-lg text-pink-950 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-500" /> AI Image Upscaling (2× / 4×)
              </h3>
              <p className="text-sm text-pink-800/90 font-medium leading-relaxed">
                Sulap fotomu jadi <strong>2× (Standar)</strong> atau <strong>4× (Ultra HD)</strong>!
                Dilengkapi pilihan karakter mode <em>Sharp</em> untuk detail tajam atau <em>Soft</em> untuk
                hasil halus alami. Cooldown 15 detik.
              </p>
            </Card>

            {/* Command 2: /filter */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-pink-500 text-white px-3.5 py-1.5 rounded-xl font-extrabold text-sm font-mono flex items-center gap-1.5 shadow-sm shadow-pink-500/30">
                  <Palette className="w-4 h-4" /> /filter [image] [preset]
                </span>
                <Badge variant="pink">Biaya: 50 💰</Badge>
              </div>
              <h3 className="font-extrabold text-lg text-pink-950 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-pink-500" /> Aesthetic Photo Filters
              </h3>
              <p className="text-sm text-pink-800/90 font-medium leading-relaxed">
                Beri sentuhan warna aesthetic manis pada fotomu dengan 4 preset instan:
                <strong> Soft Pink Glow 🌸</strong>, <strong>Vintage Warm ☕</strong>,
                <strong> B&amp;W Dreamy 🖤</strong>, dan <strong>Anime Pop 🎨</strong>. Hemat koin tanpa tiket!
              </p>
            </Card>

            {/* Command 3: /convert */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-pink-500 text-white px-3.5 py-1.5 rounded-xl font-extrabold text-sm font-mono flex items-center gap-1.5 shadow-sm shadow-pink-500/30">
                  <RefreshCw className="w-4 h-4" /> /convert [image] [format]
                </span>
                <Badge variant="pink">Biaya: 25 💰</Badge>
              </div>
              <h3 className="font-extrabold text-lg text-pink-950 mb-1.5 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-pink-500" /> Format Converter &amp; Compressor
              </h3>
              <p className="text-sm text-pink-800/90 font-medium leading-relaxed">
                Ubah format gambar secara instan ke <strong>WebP</strong>, <strong>PNG</strong>, atau
                <strong> JPG</strong> dengan opsi kualitas kompresi agar file foto kamu ringan dan muat
                dikirim di Discord!
              </p>
            </Card>

            {/* Command 4: /gift */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-pink-600 text-white px-3.5 py-1.5 rounded-xl font-extrabold text-sm font-mono flex items-center gap-1.5 shadow-sm shadow-pink-600/30">
                  <Heart className="w-4 h-4 fill-white" /> /gift [user] [amount]
                </span>
                <Badge variant="pink">Kado Spesial 💕</Badge>
              </div>
              <h3 className="font-extrabold text-lg text-pink-950 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-400" /> Kirim Kado Manis ke Teman
              </h3>
              <p className="text-sm text-pink-800/90 font-medium leading-relaxed">
                Kirim kado berupa uang jajan 💰 atau tiket limit 🎟️ langsung ke dompet temanmu
                disertai kartu ucapan pesan manis! Saldo langsung terkirim secara instan dan aman.
              </p>
            </Card>

            {/* Command 5: /claim */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-pink-500 text-white px-3.5 py-1.5 rounded-xl font-extrabold text-sm font-mono flex items-center gap-1.5 shadow-sm shadow-pink-500/30">
                  <Gift className="w-4 h-4" /> /claim
                </span>
                <Badge variant="pink">
                  <Clock className="w-3 h-3 text-pink-600" /> Daily Streak Multiplier
                </Badge>
              </div>
              <h3 className="font-extrabold text-lg text-pink-950 mb-1.5 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-pink-500" /> Hadiah Harian &amp; Streak Bonus
              </h3>
              <p className="text-sm text-pink-800/90 font-medium leading-relaxed">
                Klaim berturut-turut setiap hari untuk melipatgandakan hadiahmu! Mulai dari
                <strong> +1,000 Money</strong> di Hari 1 hingga <strong>+3,000 Money &amp; +8 Tiket HD</strong> di Hari 7+!
              </p>
            </Card>

            {/* Command 5: /balance */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-pink-500 text-white px-3.5 py-1.5 rounded-xl font-extrabold text-sm font-mono flex items-center gap-1.5 shadow-sm shadow-pink-500/30">
                  <Wallet className="w-4 h-4" /> /balance
                </span>
                <Badge variant="pink">Gratis</Badge>
              </div>
              <h3 className="font-extrabold text-lg text-pink-950 mb-1.5 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-pink-500" /> Cek Dompet &amp; Tiket Limit
              </h3>
              <p className="text-sm text-pink-800/90 font-medium leading-relaxed">
                Melihat sisa saldo uang jajan kamu, jumlah tiket limit yang tersedia, serta status
                apakah hadiah harian sudah siap diambil atau masih dalam masa cooldown.
              </p>
            </Card>

            {/* Command 6: /help */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-pink-500 text-white px-3.5 py-1.5 rounded-xl font-extrabold text-sm font-mono flex items-center gap-1.5 shadow-sm shadow-pink-500/30">
                  <HelpCircle className="w-4 h-4" /> /help
                </span>
                <Badge variant="pink">Gratis</Badge>
              </div>
              <h3 className="font-extrabold text-lg text-pink-950 mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-pink-500" /> Menu Bantuan Interaktif
              </h3>
              <p className="text-sm text-pink-800/90 font-medium leading-relaxed">
                Menampilkan menu bantuan lengkap dengan banner lucu Ayaa Bot, petunjuk penggunaan
                masing-masing perintah, serta informasi versi bot.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 📜 CHANGELOG / INFO UPDATE */}
      <section id="updates" className="pb-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-8">
            <Badge variant="pink" className="mb-2">
              <History className="w-3.5 h-3.5 text-pink-600" />
              <span>Changelog &amp; Version History</span>
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-pink-950 mt-1">
              Catatan Pembaruan Ayaa Bot
            </h2>
            <p className="text-sm sm:text-base text-pink-800/90 font-semibold mt-1">
              Rangkuman fitur baru dan peningkatan manis yang dirilis di setiap versi:
            </p>
          </div>

          <div className="space-y-6">
            {/* Version 1.2.0 */}
            <Card className="p-7 sm:p-8 relative overflow-hidden border-2 border-pink-400 bg-gradient-to-br from-white/95 via-pink-50/60 to-pink-100/50 shadow-lg shadow-pink-500/10">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-pink-200/70 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-sm px-3.5 py-1 rounded-full shadow-sm shadow-pink-500/25">
                    v1.2.0
                  </span>
                  <Badge variant="pink" className="border-pink-300">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    <span>Versi Terbaru • Social &amp; Economy Special</span>
                  </Badge>
                </div>
                <span className="text-xs sm:text-sm text-pink-700 font-bold bg-pink-100 px-3 py-1 rounded-full">
                  September 2026
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/85 p-4 rounded-2xl border border-pink-200/60 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-pink-950">
                      Fitur Kirim Kado Manis (/gift)
                    </h4>
                    <p className="text-xs sm:text-sm text-pink-800/90 font-medium mt-1 leading-relaxed">
                      Kirim kado koin 💰 atau tiket limit 🎟️ ke teman spesialmu dengan ucapan manis khusus, diproses secara instan &amp; aman.
                    </p>
                  </div>
                </div>

                <div className="bg-white/85 p-4 rounded-2xl border border-pink-200/60 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-pink-950">
                      Daily Claim Streak &amp; Multiplier Hadiah
                    </h4>
                    <p className="text-xs sm:text-sm text-pink-800/90 font-medium mt-1 leading-relaxed">
                      Sistem streak berturut-turut! Hadiah bertambah banyak tiap hari dari +1.000 Money (Hari 1) hingga +3.000 Money &amp; +8 Tiket HD (Hari 7+).
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Version 1.1.0 */}
            <Card className="p-7 sm:p-8 relative overflow-hidden border border-pink-200/80 bg-white/80">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-pink-200/70 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="bg-pink-300 text-pink-900 font-black text-sm px-3.5 py-1 rounded-full">
                    v1.1.0
                  </span>
                  <Badge variant="pink" className="border-pink-300">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    <span>Aesthetic, Tools &amp; Cron Update</span>
                  </Badge>
                </div>
                <span className="text-xs sm:text-sm text-pink-700 font-bold bg-pink-100/80 px-3 py-1 rounded-full">
                  September 2026
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/80 p-4 rounded-2xl border border-pink-200/60 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-pink-950">
                      Opsi Skala (2× &amp; 4×) &amp; Mode Karakter di /hd
                    </h4>
                    <p className="text-xs sm:text-sm text-pink-800/90 font-medium mt-1 leading-relaxed">
                      Dukungan pembesaran <strong>2× (Standar)</strong> dan <strong>4× (Ultra HD)</strong> dengan pilihan mode <em>Sharp</em> (detail tajam ekstra) serta <em>Soft</em> (halus alami).
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 p-4 rounded-2xl border border-pink-200/60 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-pink-950">
                      Command Baru: /filter (Aesthetic Presets)
                    </h4>
                    <p className="text-xs sm:text-sm text-pink-800/90 font-medium mt-1 leading-relaxed">
                      4 Preset estetik instan: <em>Soft Pink Glow 🌸, Vintage Warm ☕, B&amp;W Dreamy 🖤,</em> dan <em>Anime Pop 🎨</em> hanya 50 Money tanpa potong tiket.
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 p-4 rounded-2xl border border-pink-200/60 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-pink-950">
                      Command Baru: /convert (Format &amp; Compressor)
                    </h4>
                    <p className="text-xs sm:text-sm text-pink-800/90 font-medium mt-1 leading-relaxed">
                      Ubah format gambar ke WebP, PNG, atau JPG dengan opsi kualitas kompresi pintar hemat kuota untuk Discord.
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 p-4 rounded-2xl border border-pink-200/60 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-pink-950">
                      Optimalisasi Serverless Vercel &amp; Asynchronous Response
                    </h4>
                    <p className="text-xs sm:text-sm text-pink-800/90 font-medium mt-1 leading-relaxed">
                      Eksekusi image processing di latar belakang menggunakan <code>waitUntil</code>, bebas timeout Discord 3 detik dan proteksi memori OOM.
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 p-4 rounded-2xl border border-pink-200/60 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-pink-950">
                      Vercel Cron Jobs (Pengingat Harian 08:00 WIB)
                    </h4>
                    <p className="text-xs sm:text-sm text-pink-800/90 font-medium mt-1 leading-relaxed">
                      Cron job otomatis via <code>vercel.json</code> yang mengecek user siap claim dan mengirim sapaan manis harian ke Discord.
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 p-4 rounded-2xl border border-pink-200/60 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-pink-950">
                      Tombol Interaktif Discord (Message Components)
                    </h4>
                    <p className="text-xs sm:text-sm text-pink-800/90 font-medium mt-1 leading-relaxed">
                      Tombol interaktif <code>[🎁 Ambil Daily Claim]</code> langsung dan <code>[📜 Riwayat Transaksi]</code> secara ephemeral pada perintah <code>/balance</code>.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Version 1.0.0 */}
            <Card className="p-7 sm:p-8 border border-pink-200/70 bg-white/70">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-pink-200/60 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="bg-pink-200 text-pink-800 font-black text-sm px-3.5 py-1 rounded-full">
                    v1.0.0
                  </span>
                  <Badge variant="pink">
                    <Flower2 className="w-3.5 h-3.5 text-pink-600" />
                    <span>MVP Release (Peluncuran Perdana)</span>
                  </Badge>
                </div>
                <span className="text-xs sm:text-sm text-pink-600 font-bold bg-pink-50 px-3 py-1 rounded-full">
                  September 2026
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100/80 text-pink-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-pink-950">
                      Core AI Image Upscaling (2× HD)
                    </h4>
                    <p className="text-xs sm:text-sm text-pink-800/90 font-medium mt-1 leading-relaxed">
                      Perintah <code>/hd</code> dengan algoritma Lanczos3 berkualitas tinggi untuk mempertajam foto langsung dari Discord.
                    </p>
                  </div>
                </div>

                <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100/80 text-pink-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-pink-950">
                      Virtual Sweet Economy &amp; Daily Claim
                    </h4>
                    <p className="text-xs sm:text-sm text-pink-800/90 font-medium mt-1 leading-relaxed">
                      Sistem <code>/claim</code> uang jajan harian (+1.000 Money &amp; +5 Limit) dengan cooldown presisi 24 jam per user.
                    </p>
                  </div>
                </div>

                <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100/80 text-pink-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-pink-950">
                      Cek Dompet (/balance) &amp; Whitelist Keamanan
                    </h4>
                    <p className="text-xs sm:text-sm text-pink-800/90 font-medium mt-1 leading-relaxed">
                      Pemeriksaan saldo koin &amp; sisa tiket limit, terproteksi sistem private whitelist berbasis Neon PostgreSQL.
                    </p>
                  </div>
                </div>

                <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100/80 text-pink-500 flex items-center justify-center shrink-0 mt-0.5">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-pink-950">
                      Menu Bantuan (/help) &amp; Landing Page Manis
                    </h4>
                    <p className="text-xs sm:text-sm text-pink-800/90 font-medium mt-1 leading-relaxed">
                      Embed panduan Discord interaktif dan landing page resmi bernuansa cute soft pastel pink.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 💖 CREATED BY & SUPPORTED BY (INFO AKUN AYA) */}
      <section id="supported" className="pb-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Created By Card */}
            <Card className="p-7 flex flex-col justify-between">
              <div>
                <Badge variant="pink" className="mb-4">
                  <Code2 className="w-3.5 h-3.5 text-pink-600" />
                  <span>Developer &amp; Author</span>
                </Badge>

                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 border-pink-400 shadow-md shadow-pink-500/25 shrink-0">
                    <Image
                      src="/justdhif.png"
                      alt="Justdhif Profile"
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xl font-black text-pink-950">Justdhif</h4>
                      <BadgeCheck className="w-5 h-5 text-pink-500 fill-pink-100" />
                    </div>
                    <div className="text-sm text-pink-700 font-extrabold">
                      @Justdhif
                    </div>
                    <div className="text-xs text-pink-600 font-semibold mt-0.5">
                      Creator &amp; Developer 💻
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="https://github.com/Justdhif"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold px-5 py-2.5 rounded-full text-xs sm:text-sm shadow-md transition-all hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>Kunjungi GitHub @Justdhif</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </Card>

            {/* Supported By Card: Info Akun Aya */}
            <Card className="p-7 flex flex-col justify-between">
              <div>
                <Badge variant="pink" className="mb-4">
                  <Heart className="w-3.5 h-3.5 text-pink-600 fill-pink-400" />
                  <span>Supported &amp; Inspired By</span>
                </Badge>

                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 border-pink-400 shadow-md shadow-pink-500/25 shrink-0">
                    <Image
                      src="/avatar.jpeg"
                      alt="Ayaa Asli Profile"
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xl font-black text-pink-950">Ayaa</h4>
                      <BadgeCheck className="w-5 h-5 text-pink-500 fill-pink-100" />
                    </div>
                    <div className="text-sm text-pink-700 font-extrabold">
                      @acyash_
                    </div>
                    <div className="text-xs text-pink-600 font-semibold mt-0.5">
                      My Love 🌸
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="https://www.tiktok.com/@acyash_?_r=1&_t=ZS-99lvQg26geC"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold px-5 py-2.5 rounded-full text-xs sm:text-sm shadow-md transition-all hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.3 6.3 0 0 0 1.86-4.5V8.84a8.16 8.16 0 0 0 4.91 1.63v-3.45a4.85 4.85 0 0 1-1-.33z" />
                  </svg>
                  <span>Kunjungi TikTok @acyash_</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 💌 CONTACT & HELP SECTION */}
      <section id="contact" className="pb-10">
        <div className="max-w-5xl mx-auto px-6">
          <Card className="p-8 sm:p-10 text-center bg-gradient-to-br from-white/95 to-pink-100/80">
            <div className="w-14 h-14 mx-auto mb-3 bg-pink-200/50 rounded-full flex items-center justify-center text-pink-500">
              <Mail className="w-6 h-6" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-pink-950 mb-2">
              Contact &amp; Help Desk
            </h2>
            <p className="max-w-lg mx-auto text-sm sm:text-base text-pink-800/90 font-medium mb-6 leading-relaxed">
              Mengalami kendala saat menggunakan bot, ingin mendaftarkan ID Discord teman ke whitelist,
              atau ada pertanyaan seputar Ayaa Bot? Langsung hubungi kami melalui WhatsApp yaa:
            </p>

            <div className="flex justify-center">
              <a
                href="https://wa.me/6282113285557"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-extrabold px-8 py-4 rounded-full text-base shadow-xl shadow-pink-500/30 transition-all hover:shadow-2xl hover:shadow-pink-500/40 hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Hubungi via WhatsApp (0821-1328-5557)</span>
              </a>
            </div>
          </Card>
        </div>
      </section>

      {/* 🌸 FOOTER */}
      <footer className="text-center mt-6">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-sm font-extrabold text-pink-800 flex items-center justify-center gap-1.5">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-pink-500 fill-pink-400" />
            <span>by</span>
            <strong className="text-pink-950">Justdhif</strong>
            <span>for</span>
            <strong className="text-pink-950">Ayaa Bot</strong>
          </p>
          <p className="text-xs text-pink-600/90 mt-1">
            © {new Date().getFullYear()} Ayaa Bot. All rights reserved. • Private AI Image Upscaling &amp; Economy Bot
          </p>
        </div>
      </footer>
    </main>
  );
}
