import React from "react";

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
              src="/avatar.png"
              alt="Ayaa Bot Avatar"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                border: "2px solid #ff758f",
                boxShadow: "0 2px 8px rgba(255, 117, 143, 0.3)",
              }}
            />
            <div>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: "1.25rem",
                  color: "#590d22",
                  letterSpacing: "0.5px",
                }}
              >
                Ayaa Bot <span style={{ color: "#ff4d6d" }}>🌸</span>
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="badge-online">
              <span className="pulse-dot" /> Online • Private Bot
            </span>
            <a
              href="#contact"
              className="btn-secondary"
              style={{ padding: "8px 16px", fontSize: "0.9rem" }}
            >
              💌 Contact
            </a>
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
                src="/avatar.png"
                alt="Ayaa Bot Cute Avatar"
                style={{
                  width: "125px",
                  height: "125px",
                  borderRadius: "50%",
                  border: "5px solid #ffffff",
                  boxShadow: "0 8px 24px rgba(255, 77, 109, 0.3)",
                  backgroundColor: "#fff0f3",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "6px",
                  backgroundColor: "#ffffff",
                  borderRadius: "50%",
                  padding: "4px",
                  fontSize: "1.2rem",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                ✨
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
                <span className="badge-pink">🎀 Official Landing Page</span>
                <span className="badge-pink">✨ v1.0.0 (MVP)</span>
              </div>

              <h1
                style={{
                  fontSize: "2.6rem",
                  fontWeight: 900,
                  color: "#590d22",
                  marginBottom: "12px",
                  letterSpacing: "-0.5px",
                }}
              >
                Ayaa Bot <span style={{ color: "#ff4d6d" }}>🌸</span>
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
                langsung dari Discord, dilengkapi sistem virtual economy yang manis dan aman! 💕
              </p>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "14px",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href="https://discord.com/oauth2/authorize?client_id=1549602077083181117&permissions=8&integration_type=0&scope=bot+applications.commands"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  ✨ Invite Ayaa Bot ke Server
                </a>
                <a href="#commands" className="btn-secondary">
                  📖 Daftar Perintah Lucu
                </a>
              </div>
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
            <div
              className="glass-card"
              style={{ padding: "20px", textAlign: "center" }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "6px" }}>🖼️</div>
              <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#800f2f" }}>
                2× HD Upscaling
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#a4133c", fontWeight: 600 }}>
                Algoritma Lanczos3 tajam &amp; jernih
              </p>
            </div>

            <div
              className="glass-card"
              style={{ padding: "20px", textAlign: "center" }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "6px" }}>👛</div>
              <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#800f2f" }}>
                Sweet Economy
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#a4133c", fontWeight: 600 }}>
                Uang jajan harian &amp; tiket limit gratis
              </p>
            </div>

            <div
              className="glass-card"
              style={{ padding: "20px", textAlign: "center" }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "6px" }}>🛡️</div>
              <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#800f2f" }}>
                100% Anti-Rugi
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#a4133c", fontWeight: 600 }}>
                Saldo aman, hanya dipotong saat berhasil
              </p>
            </div>

            <div
              className="glass-card"
              style={{ padding: "20px", textAlign: "center" }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "6px" }}>⚡</div>
              <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#800f2f" }}>
                Serverless 24/7
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#a4133c", fontWeight: 600 }}>
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
            <span className="badge-pink">✨ Fitur Slash Commands</span>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 900,
                color: "#590d22",
                marginTop: "8px",
              }}
            >
              Daftar Perintah di Discord 🎀
            </h2>
            <p style={{ color: "#a4133c", fontWeight: 600 }}>
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
                    padding: "4px 12px",
                    borderRadius: "8px",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    fontFamily: "monospace",
                  }}
                >
                  /hd [image]
                </span>
                <span className="badge-pink">Cost: 100 💰 + 1 🎟️</span>
              </div>
              <h3 style={{ fontWeight: 800, fontSize: "1.15rem", color: "#590d22", marginBottom: "6px" }}>
                ✨ AI Image Upscaling 2×
              </h3>
              <p style={{ color: "#800f2f", fontSize: "0.95rem" }}>
                Kirim foto kamu (PNG, JPG, JPEG, WEBP maks 10 MB). Ayaa Bot akan langsung menyulap fotomu jadi 2× lebih tajam, bebas pecah, dan makin estetik! Dilengkapi cooldown 15 detik.
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
                    padding: "4px 12px",
                    borderRadius: "8px",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    fontFamily: "monospace",
                  }}
                >
                  /claim
                </span>
                <span className="badge-pink">Cooldown: 24 Jam</span>
              </div>
              <h3 style={{ fontWeight: 800, fontSize: "1.15rem", color: "#590d22", marginBottom: "6px" }}>
                🎁 Ambil Hadiah Uang Jajan Harian
              </h3>
              <p style={{ color: "#800f2f", fontSize: "0.95rem" }}>
                Dapatkan <strong>+1,000 Money</strong> dan <strong>+5 Tiket Limit HD</strong> gratis setiap hari! Jika belum 24 jam, Ayaa Bot akan memberi tahu sisa waktu cooldown kamu secara presisi.
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
                    padding: "4px 12px",
                    borderRadius: "8px",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    fontFamily: "monospace",
                  }}
                >
                  /balance
                </span>
                <span className="badge-pink">Gratis</span>
              </div>
              <h3 style={{ fontWeight: 800, fontSize: "1.15rem", color: "#590d22", marginBottom: "6px" }}>
                👛 Cek Dompet &amp; Tiket Limit
              </h3>
              <p style={{ color: "#800f2f", fontSize: "0.95rem" }}>
                Melihat sisa saldo uang jajan kamu, jumlah tiket limit yang tersedia, serta status apakah hadiah harian sudah siap diambil atau masih cooldown.
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
                    padding: "4px 12px",
                    borderRadius: "8px",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    fontFamily: "monospace",
                  }}
                >
                  /help
                </span>
                <span className="badge-pink">Gratis</span>
              </div>
              <h3 style={{ fontWeight: 800, fontSize: "1.15rem", color: "#590d22", marginBottom: "6px" }}>
                📖 Menu Bantuan Interaktif
              </h3>
              <p style={{ color: "#800f2f", fontSize: "0.95rem" }}>
                Menampilkan menu bantuan lengkap dengan banner lucu Ayaa Bot, petunjuk penggunaan masing-masing perintah, serta informasi versi bot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 💖 CREATED BY & SUPPORTED BY */}
      <section style={{ paddingBottom: "50px" }}>
        <div className="container">
          <div className="grid-2">
            {/* Created By Card */}
            <div className="glass-card" style={{ padding: "28px" }}>
              <span className="badge-pink" style={{ marginBottom: "12px" }}>
                👤 Creator &amp; Author
              </span>
              <h3
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 900,
                  color: "#590d22",
                  marginBottom: "12px",
                }}
              >
                Created with 💖 by Justdhif
              </h3>
              <p style={{ color: "#800f2f", fontSize: "0.95rem", marginBottom: "18px" }}>
                Proyek Ayaa Bot dikembangkan secara khusus oleh <strong>Justdhif</strong> sebagai bot private image enhancement berbasis arsitektur serverless modern.
              </p>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <a
                  href="https://github.com/Justdhif"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                >
                  🐙 GitHub @Justdhif
                </a>
                <span style={{ fontSize: "0.9rem", color: "#a4133c", fontWeight: 700 }}>
                  👑 Bot Owner &amp; Developer
                </span>
              </div>
            </div>

            {/* Supported By Card */}
            <div className="glass-card" style={{ padding: "28px" }}>
              <span className="badge-pink" style={{ marginBottom: "12px" }}>
                🚀 Tech Stack &amp; Infrastructure
              </span>
              <h3
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 900,
                  color: "#590d22",
                  marginBottom: "12px",
                }}
              >
                Supported By
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                <span className="badge-pink">🐘 Neon PostgreSQL</span>
                <span className="badge-pink">▲ Next.js 15 (App Router)</span>
                <span className="badge-pink">▲ Vercel Serverless</span>
                <span className="badge-pink">💬 Discord HTTP Interactions</span>
                <span className="badge-pink">🎨 Sharp Image Engine</span>
                <span className="badge-pink">💧 Drizzle ORM</span>
                <span className="badge-pink">📘 TypeScript</span>
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#a4133c",
                  marginTop: "16px",
                  fontStyle: "italic",
                }}
              >
                Didukung oleh teknologi cloud serverless berkecepatan tinggi tanpa server fisik lokal.
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
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 227, 232, 0.7) 100%)",
            }}
          >
            <span style={{ fontSize: "2.5rem" }}>💌</span>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 900,
                color: "#590d22",
                marginTop: "8px",
                marginBottom: "8px",
              }}
            >
              Contact &amp; Help Desk 🌸
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
              Mengalami kendala saat menggunakan bot, ingin mendaftarkan ID Discord teman ke whitelist, atau ada pertanyaan seputar Ayaa Bot? Hubungi kami lewat kontak di bawah yaa:
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "12px 20px",
                  borderRadius: "16px",
                  border: "1.5px solid #ffb3c1",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>💬</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.75rem", color: "#a4133c", fontWeight: 700 }}>
                    DISCORD DEVELOPER
                  </div>
                  <div style={{ fontWeight: 800, color: "#590d22" }}>
                    @didip0644_14058 (KAB - Nadhif)
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "12px 20px",
                  borderRadius: "16px",
                  border: "1.5px solid #ffb3c1",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>🏠</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.75rem", color: "#a4133c", fontWeight: 700 }}>
                    DISCORD SERVER
                  </div>
                  <div style={{ fontWeight: 800, color: "#590d22" }}>ayaa room</div>
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "12px 20px",
                  borderRadius: "16px",
                  border: "1.5px solid #ffb3c1",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>📧</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.75rem", color: "#a4133c", fontWeight: 700 }}>
                    EMAIL SUPPORT
                  </div>
                  <div style={{ fontWeight: 800, color: "#590d22" }}>
                    botayaa3@gmail.com
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌸 FOOTER */}
      <footer style={{ textAlign: "center", marginTop: "20px" }}>
        <div className="container">
          <p style={{ color: "#a4133c", fontSize: "0.95rem", fontWeight: 700 }}>
            Made with <span style={{ color: "#ff4d6d" }}>💖</span> by{" "}
            <strong>Justdhif</strong> for <strong>Ayaa Bot</strong> 🌸
          </p>
          <p style={{ color: "#c9184a", fontSize: "0.8rem", marginTop: "4px" }}>
            © {new Date().getFullYear()} Ayaa Bot. All rights reserved. • Private AI Image Upscaling &amp; Economy Bot
          </p>
        </div>
      </footer>
    </main>
  );
}
