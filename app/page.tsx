import React from "react";
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
  User,
  Mail,
  MessageSquare,
  Home,
  Flower2,
  BadgeCheck,
  ExternalLink,
  Code2,
  MessageCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <main style={{ paddingBottom: "80px" }}>
      {/* 🌸 NAVBAR */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          background: "rgba(255, 245, 247, 0.8)",
          borderBottom: "1.5px solid rgba(255, 204, 213, 0.6)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "14px",
            paddingBottom: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="/avatar.jpeg"
              alt="Ayaa Bot Avatar"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #ff758f",
                boxShadow: "0 2px 8px rgba(255, 117, 143, 0.3)",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: "1.25rem",
                  color: "#590d22",
                  letterSpacing: "0.5px",
                }}
              >
                Ayaa Bot
              </span>
              <Flower2 size={18} color="#ff4d6d" />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="badge-online">
              <span className="pulse-dot" /> Online • Private Bot
            </span>
          </div>
        </div>
      </header>

      {/* 🎀 HERO SECTION */}
      <section style={{ paddingTop: "32px", paddingBottom: "40px" }}>
        <div className="container">
          {/* Main Hero Card */}
          <div
            className="glass-card"
            style={{
              padding: "0 0 36px 0",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            {/* Banner Header */}
            <div
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "360px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <img
                src="/banner.png"
                alt="Ayaa Bot Cute Banner"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>

            {/* Profile Avatar overlapping */}
            <div
              style={{
                marginTop: "-65px",
                display: "inline-block",
                position: "relative",
              }}
            >
              <img
                src="/avatar.jpeg"
                alt="Ayaa Bot Cute Avatar"
                style={{
                  width: "130px",
                  height: "130px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "5px solid #ffffff",
                  boxShadow: "0 8px 24px rgba(255, 77, 109, 0.3)",
                  backgroundColor: "#fff0f3",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "6px",
                  backgroundColor: "#ffffff",
                  borderRadius: "50%",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(255, 77, 109, 0.25)",
                }}
              >
                <Sparkles size={16} color="#ff4d6d" />
              </span>
            </div>

            {/* Title & Tagline */}
            <div style={{ padding: "0 24px", marginTop: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <span className="badge-pink">
                  <Flower2 size={13} /> Official Landing Page
                </span>
                <span className="badge-pink">
                  <Sparkles size={13} /> v1.0.0 (MVP)
                </span>
              </div>

              <h1
                style={{
                  fontSize: "2.6rem",
                  fontWeight: 900,
                  color: "#590d22",
                  marginBottom: "12px",
                  letterSpacing: "-0.5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <span>Ayaa Bot</span>
                <Heart size={32} color="#ff4d6d" fill="#ff758f" />
              </h1>

              <p
                style={{
                  fontSize: "1.15rem",
                  color: "#a4133c",
                  maxWidth: "640px",
                  margin: "0 auto 28px auto",
                  fontWeight: 600,
                }}
              >
                Teman AI gemas untuk bikin fotomu <strong>2× lebih jernih, tajam &amp; HD</strong>{" "}
                langsung dari Discord, dilengkapi sistem virtual economy yang manis dan aman!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 STATS & HIGHLIGHTS */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 12px auto",
                  background: "rgba(255, 117, 143, 0.15)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ImageIcon size={24} color="#ff4d6d" />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#800f2f" }}>
                2× HD Upscaling
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#a4133c", fontWeight: 600, marginTop: "4px" }}>
                Algoritma Lanczos3 tajam &amp; jernih
              </p>
            </div>

            <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 12px auto",
                  background: "rgba(255, 117, 143, 0.15)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Wallet size={24} color="#ff4d6d" />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#800f2f" }}>
                Sweet Economy
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#a4133c", fontWeight: 600, marginTop: "4px" }}>
                Uang jajan harian &amp; tiket limit gratis
              </p>
            </div>

            <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 12px auto",
                  background: "rgba(255, 117, 143, 0.15)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={24} color="#ff4d6d" />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#800f2f" }}>
                100% Anti-Rugi
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#a4133c", fontWeight: 600, marginTop: "4px" }}>
                Saldo aman, hanya dipotong saat sukses
              </p>
            </div>

            <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 12px auto",
                  background: "rgba(255, 117, 143, 0.15)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Zap size={24} color="#ff4d6d" />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#800f2f" }}>
                Serverless 24/7
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#a4133c", fontWeight: 600, marginTop: "4px" }}>
                Aktif cepat di Vercel &amp; Neon DB
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🎮 COMMANDS SHOWCASE */}
      <section id="commands" style={{ paddingBottom: "50px" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <span className="badge-pink">
              <Sparkles size={14} /> Fitur Slash Commands
            </span>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 900,
                color: "#590d22",
                marginTop: "8px",
              }}
            >
              Daftar Perintah di Discord
            </h2>
            <p style={{ color: "#a4133c", fontWeight: 600, marginTop: "4px" }}>
              Cukup ketik perintah di bawah ini di server Discord tempat Ayaa Bot berada:
            </p>
          </div>

          <div className="grid-2">
            {/* Command 1: /hd */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "#ff4d6d",
                    color: "white",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    fontFamily: "monospace",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <ImageIcon size={16} /> /hd [image]
                </span>
                <span className="badge-pink">Biaya: 100 💰 + 1 🎟️</span>
              </div>
              <h3
                style={{
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  color: "#590d22",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sparkles size={18} color="#ff4d6d" /> AI Image Upscaling 2×
              </h3>
              <p style={{ color: "#800f2f", fontSize: "0.95rem" }}>
                Kirim foto kamu (PNG, JPG, JPEG, WEBP maks 10 MB). Ayaa Bot akan langsung menyulap
                fotomu jadi 2× lebih tajam, bebas pecah, dan makin estetik! Dilengkapi cooldown 15
                detik.
              </p>
            </div>

            {/* Command 2: /claim */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "#ff758f",
                    color: "white",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    fontFamily: "monospace",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Gift size={16} /> /claim
                </span>
                <span className="badge-pink">
                  <Clock size={13} /> Cooldown 24 Jam
                </span>
              </div>
              <h3
                style={{
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  color: "#590d22",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Gift size={18} color="#ff4d6d" /> Ambil Hadiah Uang Jajan Harian
              </h3>
              <p style={{ color: "#800f2f", fontSize: "0.95rem" }}>
                Dapatkan <strong>+1,000 Money</strong> dan <strong>+5 Tiket Limit HD</strong> gratis
                setiap hari! Jika belum 24 jam, Ayaa Bot akan memberi tahu sisa waktu cooldown kamu
                secara presisi.
              </p>
            </div>

            {/* Command 3: /balance */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "#ff758f",
                    color: "white",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    fontFamily: "monospace",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Wallet size={16} /> /balance
                </span>
                <span className="badge-pink">Gratis</span>
              </div>
              <h3
                style={{
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  color: "#590d22",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Wallet size={18} color="#ff4d6d" /> Cek Dompet &amp; Tiket Limit
              </h3>
              <p style={{ color: "#800f2f", fontSize: "0.95rem" }}>
                Melihat sisa saldo uang jajan kamu, jumlah tiket limit yang tersedia, serta status
                apakah hadiah harian sudah siap diambil atau masih dalam masa cooldown.
              </p>
            </div>

            {/* Command 4: /help */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "#ff758f",
                    color: "white",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    fontFamily: "monospace",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <HelpCircle size={16} /> /help
                </span>
                <span className="badge-pink">Gratis</span>
              </div>
              <h3
                style={{
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  color: "#590d22",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <HelpCircle size={18} color="#ff4d6d" /> Menu Bantuan Interaktif
              </h3>
              <p style={{ color: "#800f2f", fontSize: "0.95rem" }}>
                Menampilkan menu bantuan lengkap dengan banner lucu Ayaa Bot, petunjuk penggunaan
                masing-masing perintah, serta informasi versi bot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 💖 CREATED BY & SUPPORTED BY (INFO AKUN AYA) */}
      <section id="supported" style={{ paddingBottom: "50px" }}>
        <div className="container">
          <div className="grid-2">
            {/* Created By Card */}
            <div className="glass-card" style={{ padding: "28px" }}>
              <span className="badge-pink" style={{ marginBottom: "14px" }}>
                <Code2 size={14} /> Developer &amp; Author
              </span>
              <h3
                style={{
                  fontSize: "1.45rem",
                  fontWeight: 900,
                  color: "#590d22",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>Created by Justdhif</span>
                <Heart size={20} color="#ff4d6d" fill="#ff758f" />
              </h3>
              <p style={{ color: "#800f2f", fontSize: "0.95rem", marginBottom: "18px" }}>
                Bot ini dirancang dan dikembangkan oleh <strong>Justdhif</strong> dengan arsitektur
                serverless modern berbasis Next.js, Drizzle ORM, dan Neon PostgreSQL untuk
                pengalaman image upscaling yang cepat dan aman.
              </p>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <a
                  href="https://github.com/Justdhif"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                >
                  <ExternalLink size={14} />
                  <span>GitHub @Justdhif</span>
                </a>
              </div>
            </div>

            {/* Supported By Card: Info Akun Aya */}
            <div className="glass-card" style={{ padding: "28px" }}>
              <span className="badge-pink" style={{ marginBottom: "14px" }}>
                <Heart size={14} color="#ff4d6d" fill="#ff758f" /> Supported &amp; Inspired By
              </span>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginTop: "6px",
                  marginBottom: "14px",
                }}
              >
                <img
                  src="/avatar.jpeg"
                  alt="Ayaa Profile"
                  style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #ff758f",
                    boxShadow: "0 4px 14px rgba(255, 117, 143, 0.35)",
                  }}
                />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <h4
                      style={{
                        fontSize: "1.35rem",
                        fontWeight: 900,
                        color: "#590d22",
                      }}
                    >
                      Ayaa
                    </h4>
                    <BadgeCheck size={20} color="#ff4d6d" fill="#ffe3e8" />
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#a4133c",
                      fontWeight: 700,
                    }}
                  >
                    @ayaabot • AyaaBot
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#c9184a",
                      fontWeight: 600,
                      marginTop: "2px",
                    }}
                  >
                    Host &amp; Official Muse of Ayaa Bot
                  </div>
                </div>
              </div>

              <p style={{ color: "#800f2f", fontSize: "0.95rem", lineHeight: "1.5" }}>
                Didedikasikan dan didukung penuh oleh akun <strong>Ayaa</strong> di server{" "}
                <strong>ayaa room</strong> sebagai inspirasi utama hadirnya bot ini. Menemani harimu
                bikin foto jadi makin manis dan tajam!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 💌 CONTACT & HELP SECTION */}
      <section id="contact" style={{ paddingBottom: "40px" }}>
        <div className="container">
          <div
            className="glass-card"
            style={{
              padding: "36px",
              textAlign: "center",
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 227, 232, 0.75) 100%)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                margin: "0 auto 12px auto",
                background: "rgba(255, 117, 143, 0.18)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mail size={26} color="#ff4d6d" />
            </div>

            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 900,
                color: "#590d22",
                marginBottom: "8px",
              }}
            >
              Contact &amp; Help Desk
            </h2>
            <p
              style={{
                maxWidth: "600px",
                margin: "0 auto 24px auto",
                color: "#800f2f",
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              Mengalami kendala saat menggunakan bot, ingin mendaftarkan ID Discord teman ke whitelist,
              atau ada pertanyaan seputar Ayaa Bot? Hubungi kami lewat kontak di bawah yaa:
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <a
                href="https://wa.me/6282113285557"
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px 36px",
                  fontSize: "1.05rem",
                  textDecoration: "none",
                  boxShadow: "0 10px 24px rgba(255, 77, 109, 0.35)",
                }}
              >
                <MessageCircle size={22} />
                <span>Hubungi via WhatsApp (0821-1328-5557)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 🌸 FOOTER */}
      <footer style={{ textAlign: "center", marginTop: "20px" }}>
        <div className="container">
          <p
            style={{
              color: "#a4133c",
              fontSize: "0.95rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <span>Made with</span>
            <Heart size={16} color="#ff4d6d" fill="#ff758f" />
            <span>by</span>
            <strong>Justdhif</strong>
            <span>for</span>
            <strong>Ayaa Bot</strong>
          </p>
          <p style={{ color: "#c9184a", fontSize: "0.8rem", marginTop: "4px" }}>
            © {new Date().getFullYear()} Ayaa Bot. All rights reserved. • Private AI Image Upscaling &amp; Economy Bot
          </p>
        </div>
      </footer>
    </main>
  );
}
