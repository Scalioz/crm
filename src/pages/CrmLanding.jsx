import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, LayoutDashboard, Users, MessageCircle } from "lucide-react";

export default function CrmLanding() {
  return (
    <main className="crm-landing-page">
      <nav className="crm-landing-nav">
        <div>
          <h1>Scalioz CRM</h1>
          <p>Business tools built for growth</p>
        </div>

        <Link to="/login" className="crm-nav-btn">
          Login
        </Link>
      </nav>

      <section className="crm-landing-hero">
        <div>
          <span className="crm-badge">SCALIOZ PRODUCT SUITE</span>

          <h2>CRM tools for growing businesses.</h2>

          <p>
            Access Scalioz business automation tools built to help SMEs manage
            leads, follow-ups, sales activity and customer conversations from one
            simple workspace.
          </p>
        </div>
      </section>

      <section className="crm-product-section">
        <div className="crm-section-header">
          <p>Available CRM Product</p>
          <h2>Choose your CRM workspace</h2>
        </div>

        <div className="crm-product-grid">
          <div className="crm-product-card">
            <div className="crm-product-top">
              <div className="crm-product-icon">
                <LayoutDashboard size={32} />
              </div>

              <span className="crm-status-pill">Live</span>
            </div>

            <h3>Scalioz Lead CRM Lite</h3>

            <p>
              A lightweight CRM to manage leads, follow-ups, sales pipeline,
              tasks and customer interactions for small and growing businesses.
            </p>

            <div className="crm-feature-list">
              <div>
                <CheckCircle size={18} />
                Lead management
              </div>
              <div>
                <CheckCircle size={18} />
                Follow-up tracking
              </div>
              <div>
                <CheckCircle size={18} />
                Pipeline dashboard
              </div>
              <div>
                <CheckCircle size={18} />
                CSV export
              </div>
            </div>

            <div className="crm-product-stats">
              <div>
                <Users size={18} />
                SME ready
              </div>
              <div>
                <MessageCircle size={18} />
                WhatsApp workflow
              </div>
            </div>

            <Link to="/login" className="crm-card-btn">
              Open Lead CRM
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}