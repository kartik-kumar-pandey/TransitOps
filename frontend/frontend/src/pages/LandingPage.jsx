import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Truck, Users, Navigation, BarChart3, Wrench, Sparkles,
  Search, ArrowRight, Sun, Moon, Menu, X, Star, CheckCircle2,
  TrendingUp, Shield, Mail, Phone, Globe, ExternalLink,
  ClipboardCheck, MapPin, ShieldCheck, Coins
} from 'lucide-react';

/* ─── CSS Styles ───────────────────────────────────────────── */
const CSS = `
  :root {
    --bg-color: #F7F8FA;
    --panel-bg: #FFFFFF;
    --text-primary: #14181F;
    --text-secondary: #6B7480;
    
    --accent-color: #E8940C; /* Amber */
    --accent-hover: #c47c0a;
    
    --accent-secondary: #1857E8; /* Signal Blue */
    --status-teal: #0E9E7A;
    
    --border-color: #E1E5EB;
    
    --font-display: 'Big Shoulders Display', system-ui, sans-serif;
    --font-body: 'IBM Plex Sans', system-ui, sans-serif;
    --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
    
    /* Keep old variables for the rest of the page */
    --bg: #F7F8FA;
    --bg-subtle: #f3f4f6;
    --bg-card: #ffffff;
    --border: #e5e7eb;
    --border-hover: #E8940C;
    --text: #14181F;
    --text-muted: #6B7480;
    --text-muted2: #9ca3af;
    --accent: #E8940C;
    --accent-hover: #c47c0a;
    --accent-bg: rgba(232, 148, 12, 0.05);
    --shadow: 0 8px 24px rgba(0,0,0,0.08);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    background-color: var(--bg-color);
    color: var(--text-primary); 
    font-family: var(--font-body);
  }
  .app-container {
    width: 100%;
    margin: 0 auto;
    background-color: transparent;
    min-height: 100vh;
    overflow-x: hidden;
  }
  .font-display { font-family: var(--font-display) !important; }

  /* Role Cards */
  .role-card {
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 2px rgba(20,24,31,0.04);
    transition: transform 200ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .role-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(20,24,31,0.08);
    border-color: color-mix(in srgb, var(--role-accent) 40%, #E1E5EB);
  }
  
  .role-icon-badge {
    position: relative;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin-bottom: 16px;
    background: #FFFFFF;
    transition: border-color 200ms ease-out;
  }
  
  .role-icon-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 44px;
    height: 44px;
    margin-top: -22px;
    margin-left: -22px;
    border-radius: 50%;
    transform: scale(0.3);
    opacity: 0;
    transition: transform 250ms ease-out, opacity 250ms ease-out;
    z-index: 1;
  }
  .role-card:hover .role-icon-overlay {
    transform: scale(4);
    opacity: 1;
  }
  
  .role-icon-badge svg {
    position: relative;
    z-index: 2;
    color: var(--text-primary);
    width: 20px;
    height: 20px;
    transition: color 200ms ease-out;
  }
  .role-card:hover .role-icon-badge svg {
    color: #FFFFFF;
  }
  
  .role-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  .role-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  /* ── reusable hover card ── */
  .feat-card {
    transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease, border-color 0.25s ease;
    border: 1px solid var(--border);
    background: var(--bg-card);
  }
  .feat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow);
    border-color: var(--border-hover);
  }

  /* ── animated workflow step card ── */
  .steps-container {
    position: relative;
    padding-top: 16px;
  }
  
  .steps-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(300px, 1fr));
    gap: 24px;
    align-items: start;
  }
  
  .step-card {
    background: #fff;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    display: flex;
    position: relative;
    box-shadow: 0 1px 2px rgba(20,24,31,0.04), 0 1px 1px rgba(20,24,31,0.03);
    transition: transform 200ms ease-out, box-shadow 200ms ease-out;
  }
  
  /* Amber border fades in on hover */
  .step-card::after {
    content: '';
    position: absolute;
    inset: -1px;
    border: 1px solid var(--accent-color);
    border-radius: 12px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 200ms ease-out;
    z-index: 2;
  }
  
  .step-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 32px rgba(20,24,31,0.10);
  }
  .step-card:hover::after {
    opacity: 1;
  }
  
  .step-stub {
    width: 24px;
    flex-shrink: 0;
    border-right: 2px dashed var(--border-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    background: transparent;
  }
  
  /* Stub-zone color wash */
  .step-stub::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(232,148,12,0.06);
    transform-origin: top;
    transform: scaleY(0);
    transition: transform 200ms ease-out;
    z-index: 0;
  }
  .step-card:hover .step-stub::before {
    transform: scaleY(1);
  }
  
  /* Punched-hole dots */
  .step-stub::after {
    content: '';
    position: absolute;
    right: -3px;
    top: 12px;
    bottom: 12px;
    width: 6px;
    background-image: radial-gradient(circle at center, #E1E5EB 2px, transparent 2.5px);
    background-size: 100% 16px;
    z-index: 1;
  }
  
  
  
  .step-content {
    padding: 32px 28px;
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  
  .icon-wrap {
    position: relative;
    width: 56px;
    height: 56px;
    margin-bottom: 20px;
    background: #F1F3F6;
    border-radius: 50%;
    overflow: hidden;
  }
  
  .icon-badge {
    position: absolute;
    inset: 0;
    background: transparent;
    border: 2px solid #E1E5EB;
    border-radius: 50%;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 200ms ease-out;
  }
  .step-card:hover .icon-badge {
    border-color: #F5C979;
  }
  
  .icon-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 56px;
    height: 56px;
    margin-top: -28px;
    margin-left: -28px;
    background: var(--accent-color);
    border-radius: 50%;
    transform: scale(0.3);
    opacity: 0;
    transition: transform 300ms ease-out, opacity 300ms ease-out;
    z-index: 1;
  }
  .step-card:hover .icon-overlay {
    transform: scale(4);
    opacity: 1;
  }
  
  .icon-badge svg {
    position: relative;
    z-index: 2;
    color: var(--text-primary);
    width: 24px;
    height: 24px;
    transition: color 200ms ease-out;
  }
  .step-card:hover .icon-badge svg {
    color: #FFFFFF;
  }
  
  .step-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  .step-desc {
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .step-desc * {
    color: inherit !important;
    text-decoration: none !important;
    border: none !important;
    background: transparent !important;
  }
  
  .micro-link {
    margin-top: 16px;
    font-size: 13px;
    font-weight: 600;
    color: var(--accent-color);
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0;
    transform: translateX(-6px);
    transition: opacity 200ms ease-out, transform 200ms ease-out;
    text-decoration: none;
  }
  .step-card:hover .micro-link {
    opacity: 1;
    transform: translateX(0);
  }

  /* MARQUEE TESTIMONIALS */
  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  .marquee-track {
    display: flex;
    gap: 20px;
    width: max-content;
    animation: marquee 40s linear infinite;
  }
  .marquee-track:hover {
    animation-play-state: paused;
  }
  @media (prefers-reduced-motion: reduce) {
    .marquee-track {
      animation: none;
      overflow-x: auto;
      width: 100%;
    }
    .marquee-container {
      mask-image: none !important;
      -webkit-mask-image: none !important;
    }
  }

  .testimonial-card {
    width: 360px;
    height: auto;
    background: #FFFFFF;
    border: 1px solid #E1E5EB;
    border-radius: 16px;
    padding: 32px 28px;
    box-shadow: 0 1px 2px rgba(20,24,31,0.04);
    transition: transform 200ms ease-out, box-shadow 200ms ease-out;
    display: flex;
    flex-direction: column;
  }
  .testimonial-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(20,24,31,0.08);
  }
  .testimonial-card a, .testimonial-card span {
    color: inherit !important;
    text-decoration: none !important;
  }
  
  /* ACCESS SECTION */
  .access-desc * {
    color: inherit !important;
    text-decoration: none !important;
  }
  
  @keyframes pulse-live {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.5); }
  }
  .live-dot {
    width: 6px;
    height: 6px;
    background-color: var(--accent-color);
    border-radius: 50%;
    animation: pulse-live 2.5s ease-in-out infinite;
  }
  
  .btn-launch-hub {
    transition: transform 150ms ease-out, box-shadow 150ms ease-out;
  }
  .btn-launch-hub:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(232,148,12,0.25);
  }
  .btn-launch-hub svg {
    transition: transform 150ms ease-out;
  }
  .btn-launch-hub:hover svg {
    transform: translateX(4px);
  }
  
  .demo-row {
    transition: background-color 150ms ease-out;
  }
  .demo-row:hover {
    background-color: #F7F8FA;
  }
  .demo-row:hover .badge-bg {
    opacity: 0.14 !important;
  }
  .demo-btn {
    transition: all 150ms ease-out !important;
  }
  .demo-row:hover .demo-btn {
    transform: translateY(-1px);
    background-color: var(--row-accent) !important;
    color: #FFFFFF !important;
    border-color: var(--row-accent) !important;
  }
  /* end ACCESS SECTION */

  /* ── button base ── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600;
    cursor: pointer; text-decoration: none; border: none; outline: none;
    transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  }
  .btn:active { transform: scale(0.97); }

  .btn-primary {
    background: var(--text); color: var(--bg);
  }
  .btn-primary:hover { opacity: 0.9; }

  .btn-accent {
    background: var(--accent); color: #ffffff;
  }
  .btn-accent:hover { background: var(--accent-hover); }

  .btn-outline {
    background: transparent; color: var(--text);
    border: 1px solid var(--border);
  }
  .btn-outline:hover {
    background: var(--bg-subtle);
    border-color: var(--border-hover);
  }

  /* NEW HERO STYLES */
  .hero-wrapper {
    background: #FFFFFF;
    border-bottom: 1px solid var(--border-color);
  }
  .header-new {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 48px;
    max-width: 1400px;
    margin: 0 auto;
  }
  .logo-new {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }
  .logo-text {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    text-transform: none;
  }
  .nav-container {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  .nav-new {
    display: flex;
    align-items: center;
    gap: 32px;
    padding: 8px 24px;
    border-radius: 100px;
    border: 1px solid var(--border-color);
  }
  .nav-new a {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    font-size: 15px;
    transition: color 0.15s ease;
  }
  .nav-new a:hover { color: var(--text-primary); }
  
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .link-signin {
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 500;
    font-size: 15px;
  }
  .btn-pill-amber {
    background: var(--accent-color);
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: transform 0.15s ease;
  }
  .btn-pill-amber:hover {
    transform: translateY(-2px);
  }
  
  .hero-new {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 80px 48px 120px;
  }
  
  .hero-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
  }
  .badge-new {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
    border: 1px solid var(--accent-color);
    color: var(--accent-color);
    margin-bottom: 24px;
    width: fit-content;
  }
  .live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--accent-color);
    animation: pulse-dot 2s infinite;
  }
  @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  
  .h1-new {
    font-family: var(--font-display);
    font-size: clamp(64px, 7vw, 104px);
    line-height: 0.9;
    font-weight: 800;
    text-transform: uppercase;
    margin: 0 0 24px;
    letter-spacing: -1px;
  }
  .h1-line1 { color: var(--text-primary); display: block; }
  .h1-line2 { color: var(--accent-color); display: block; }
  
  .hero-desc {
    font-size: 18px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 40px;
    max-width: 440px;
  }
  .cta-row {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 64px;
  }
  .btn-solid-amber {
    background: var(--accent-color);
    color: #fff;
    padding: 16px 32px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .btn-solid-amber:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(232, 148, 12, 0.25);
  }
  .link-learn {
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 500;
    font-size: 16px;
  }
  
  .manifest-stack-wrap {
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 10;
  }
  .manifest-stack {
    position: relative;
    width: 60px;
    height: 48px;
  }
  .m-card {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: #fff;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(20,24,31,0.05);
    border-left: 2px dashed var(--border-color);
    transform-origin: bottom left;
    transition: transform 0.15s ease-out;
  }
  .m-card:nth-child(1) { transform: rotate(-4deg); z-index: 1; }
  .m-card:nth-child(2) { transform: rotate(0deg) translate(2px, -2px); z-index: 2; }
  .m-card:nth-child(3) { transform: rotate(3deg) translate(4px, -4px); z-index: 3; }
  
  .manifest-stack-wrap:hover .m-card:nth-child(1) { transform: rotate(-8deg) translateY(-1px); }
  .manifest-stack-wrap:hover .m-card:nth-child(2) { transform: rotate(-2deg) translate(2px, -3px); }
  .manifest-stack-wrap:hover .m-card:nth-child(3) { transform: rotate(5deg) translate(4px, -5px); }
  
  .manifest-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .manifest-text span {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
  }
  .manifest-text a {
    font-size: 13px;
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 600;
  }
  
  .hero-right {
    display: flex;
    flex-direction: column;
    position: relative;
  }
  
  .stat-trio {
    display: flex;
    justify-content: flex-end;
    gap: 40px;
    margin-bottom: 20px;
  }
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .stat-item .num {
    font-family: var(--font-mono);
    font-size: 32px;
    font-weight: 600;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }
  .stat-item .label {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  .vehicle-stage {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 480px;
  }
  .ground-shadow {
    position: absolute;
    bottom: 15%;
    width: 70%;
    height: 16px;
    background: radial-gradient(ellipse at center, rgba(20,24,31,0.08) 0%, rgba(20,24,31,0) 70%);
    border-radius: 50%;
  }
  .route-line-ground {
    position: absolute;
    bottom: calc(15% + 6px);
    width: 60%;
    height: 2px;
    background: var(--accent-color);
    border-radius: 2px;
  }
  .route-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #fff;
    border: 2px solid var(--accent-color);
    border-radius: 50%;
    top: -3px;
    left: 20%;
  }
  .vehicle-svg {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 480px;
  }
  
  /* Labeled Diagram Chips */
  .status-chip {
    position: absolute;
    background: #fff;
    border: 1px solid var(--border-color);
    padding: 6px 12px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    z-index: 5;
    animation: slide-fade-in 0.4s ease-out backwards;
  }
  .status-chip::after {
    content: '';
    position: absolute;
    width: 40px;
    height: 1px;
    background: var(--border-color);
    z-index: -1;
  }
  .chip-1 { top: 25%; left: -5%; animation-delay: 0.1s; }
  .chip-1::after { right: -40px; top: 50%; width: 50px; }
  
  .chip-2 { top: 15%; right: 10%; animation-delay: 0.2s; }
  .chip-2::after { left: -30px; top: 50%; width: 30px; transform: rotate(15deg); transform-origin: left; }
  
  .chip-3 { bottom: 25%; left: 0%; animation-delay: 0.3s; }
  .chip-3::after { right: -50px; top: 50%; width: 50px; transform: rotate(-10deg); transform-origin: right; }
  
  .chip-dot { width: 8px; height: 8px; border-radius: 50%; }
  .dot-blue { background-color: var(--accent-secondary); }
  .dot-amber { background-color: var(--accent-color); }
  
  .corner-card {
    position: absolute;
    bottom: 0;
    right: 0;
    background: #fff;
    border: 1px solid var(--border-color);
    padding: 24px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 10;
    animation: slide-fade-in 0.4s ease-out backwards;
    animation-delay: 0.4s;
    box-shadow: 0 4px 16px rgba(20,24,31,0.05);
  }
  .corner-title { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
  .corner-val {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-size: 40px;
    font-weight: 600;
    color: var(--accent-color);
    line-height: 1;
    margin-bottom: 12px;
  }
  .dot-grid-graphic {
    width: 140px;
    height: 40px;
    opacity: 0.5;
    animation: pop-grid 1s ease-out forwards;
  }
  @keyframes pop-grid {
    0% { opacity: 0.2; }
    100% { opacity: 0.8; }
  }
  @keyframes slide-fade-in {
    0% { opacity: 0; transform: translateY(12px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  /* ── responsive adjustments ── */
  @media (max-width: 1024px) {
    .hero-new { grid-template-columns: 1fr; gap: 48px; text-align: center; }
    .hero-left { align-items: center; }
    .hero-desc { margin: 0 auto 40px; }
    .cta-row { justify-content: center; }
    .stat-trio { justify-content: center; margin-bottom: 40px; }
    .vehicle-stage { min-height: 300px; }
    .chip-1 { left: 10%; }
    .chip-2 { display: none; }
    .chip-3 { display: none; }
    .corner-card { position: relative; width: 100%; align-items: center; bottom: auto; margin-top: 40px; }
  }
  @media (max-width: 960px) {
    .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; text-align: center; }
    .hero-text-container { display: flex; flex-direction: column; align-items: center; }
    .hero-ctas { justify-content: center; }
    .steps-grid { grid-template-columns: 1fr !important; }
    .roles-grid { grid-template-columns: 1fr 1fr !important; }
    .testimonials-grid { grid-template-columns: 1fr !important; }
    .footer-grid { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 768px) {
    .header-new { padding: 16px 24px; }
    .nav-container { display: none; }
    .nav-actions { display: none; }
    .h1-new { font-size: 48px; }
  }
  @media (max-width: 600px) {
    .roles-grid { grid-template-columns: 1fr !important; }
    .footer-grid { grid-template-columns: 1fr !important; }
  }
`;

const STEPS = [
  { step: '01', icon: Truck, title: 'Register your fleet',  desc: 'Populate vehicle registry and driver profiles. Import using CSV uploads or add records manually.' },
  { step: '02', icon: Sparkles, title: 'Intelligent dispatch',  desc: 'Dispatch routes with AI-assisted safety ratings, license category verifications, and capacity fit checks.' },
  { step: '03', icon: Navigation, title: 'Track in real-time',    desc: 'Animate dispatches and simulate progress. Fuel logging, expenses, and analytics compile automatically.' },
];

const ROLES = [
  { name: 'Fleet Manager',     access: 'Full Operations Control', icon: ClipboardCheck, accent: '#1857E8' },
  { name: 'Driver',            access: 'Log Expenses & View Trips', icon: MapPin, accent: '#0E9E7A' },
  { name: 'Safety Officer',    access: 'Credential Alerts & Scores', icon: ShieldCheck, accent: '#E8503A' },
  { name: 'Financial Analyst', access: 'Cost Forecasts & ROI Reports', icon: Coins, accent: '#E8940C' },
];

const TESTIMONIALS = [
  { name: 'Sarah K.',  role: 'Fleet Manager, LogiCorp',    text: 'Dispatch timelines cut down significantly. The AI suggestions keep our load capacity optimized.' },
  { name: 'Ravi M.',   role: 'Safety Officer, FreightLine', text: 'Credential alerts help us maintain compliance checks effortlessly. Essential fleet operational tool.' },
  { name: 'Dana W.',   role: 'Financial Analyst, TruckCo', text: 'The expense audits, fuel tracking, and cost projections save hours of spreadsheet compilation every week.' },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{CSS}</style>
      <div className="app-container">
        <div className="hero-wrapper">
          {/* NEW HEADER */}
          <header className="header-new">
            <Link to="/" className="logo-new">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 20 12 12 20 12" />
                <circle cx="20" cy="12" r="2" fill="var(--accent-color)" />
              </svg>
              <span className="logo-text">TransitOps</span>
            </Link>
            
            <div className="nav-container">
              <nav className="nav-new hidden md:flex">
                <a href="#how-it-works">Home</a>
                <a href="#how-it-works">Fleet</a>
                <a href="#how-it-works">Pricing</a>
                <a href="#roles">Contact</a>
              </nav>
            </div>
            
            <div className="nav-actions">
              <Link to="/login" className="link-signin">Sign In</Link>
              <Link to="/login" className="btn-pill-amber">
                <Users size={16} />
                Log In
              </Link>
            </div>
          </header>
  
          {/* NEW HERO */}
          <section className="hero-new">
            <div className="hero-left">
                <div className="badge-new">
                  <div className="live-dot"></div>
                  REAL-TIME FLEET VISIBILITY
                </div>
                
                <h1 className="h1-new">
                  <span className="h1-line1">FULL FLEET,</span>
                  <span className="h1-line2">FULL CONTROL.</span>
                </h1>
                
                <p className="hero-desc">
                  Unify dispatching, safety compliance, and cost tracking. Leverage predictive routing and live telemetry to operate at maximum efficiency.
                </p>
                
                <div className="cta-row">
                  <Link to="/login" className="btn-solid-amber">
                    Explore Dashboard
                    <ArrowRight size={18} />
                  </Link>
                  <a href="#how-it-works" className="link-learn">
                    Learn More &rarr;
                  </a>
                </div>
                
                {/* Interactive Manifest Deck */}
                <div className="manifest-stack-wrap">
                  <div className="manifest-stack">
                    <div className="m-card"></div>
                    <div className="m-card"></div>
                    <div className="m-card"></div>
                  </div>
                  <div className="manifest-text">
                    <span>Live manifest updates every trip.</span>
                    <Link to="/login">View Log &rarr;</Link>
                  </div>
                </div>
              </div>
              
              <div className="hero-right">
                {/* Top-Right Stats */}
                <div className="stat-trio hidden md:flex">
                  <div className="stat-item">
                    <span className="num">97%</span>
                    <span className="label">On-Time Dispatch</span>
                  </div>
                  <div className="stat-item">
                    <span className="num">120+</span>
                    <span className="label">Fleets Onboarded</span>
                  </div>
                  <div className="stat-item">
                    <span className="num">24/7</span>
                    <span className="label">Live Monitoring</span>
                  </div>
                </div>
                
                {/* Central Vehicle Graphic */}
                <div className="vehicle-stage">
                  <div className="ground-shadow"></div>
                  <div className="route-line-ground">
                    <div className="route-dot"></div>
                  </div>
                  
                  {/* Floating Chips anchored to vehicle */}
                  <div className="status-chip chip-1">
                    <div className="chip-dot dot-blue"></div>
                    Live Tracking
                  </div>
                  <div className="status-chip chip-2">
                    <div className="chip-dot dot-amber"></div>
                    On-Time Status
                  </div>
                  <div className="status-chip chip-3">
                    <div className="chip-dot dot-amber"></div>
                    Verified Driver
                  </div>
                  
                  {/* Clean Geometric Truck */}
                  <svg className="vehicle-svg" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="40" y="40" width="220" height="130" rx="8" fill="#151C2B" />
                    <rect x="56" y="56" width="188" height="98" rx="4" fill="#2A3244" />
                    <path d="M270 90H320C330 90 345 105 350 120L360 170H270V90Z" fill="#151C2B" />
                    <path d="M280 100H315C320 100 330 110 335 125H280V100Z" fill="#2A3244" />
                    <circle cx="100" cy="180" r="28" fill="#151C2B" />
                    <circle cx="100" cy="180" r="12" fill="#2A3244" />
                    <circle cx="310" cy="180" r="28" fill="#151C2B" />
                    <circle cx="310" cy="180" r="12" fill="#2A3244" />
                  </svg>
                </div>
                
                {/* Corner Stat Card with Dot Grid */}
                <div className="corner-card">
                  <span className="corner-title">Trips Dispatched This Month</span>
                  <span className="corner-val">14,208</span>
                  <svg className="dot-grid-graphic" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="dot-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1.5" fill="var(--accent-color)" />
                    </pattern>
                    <rect x="0" y="0" width="140" height="40" fill="url(#dot-pattern)" />
                    <rect x="0" y="0" width="140" height="40" fill="url(#fade-grad)" />
                    <defs>
                      <linearGradient id="fade-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                        <stop offset="100%" stopColor="#fff" stopOpacity="1" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </section>
          </div>

          <main>
          {/* How It Works Section */}
          <section id="how-it-works" style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
              <div style={{ marginBottom: 48 }}>
                <span className="font-display" style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', tracking: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Workflow</span>
                <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  Get operational in minutes
                </h2>
              </div>

              <div className="steps-container">
                <div className="steps-grid">
                  {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="step-card">
                        <div className="step-stub">
                        </div>
                        <div className="step-content">
                          <div className="icon-wrap">
                            <div className="icon-overlay"></div>
                            <div className="icon-badge">
                              <Icon />
                            </div>
                          </div>
                          <h3 className="step-title">{s.title}</h3>
                          <p className="step-desc">{s.desc}</p>
                          <Link to="/login" className="micro-link">
                            Learn more <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Roles Access Grid */}
          <section id="roles" style={{ borderBottom: '1px solid var(--border)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
              <div style={{ marginBottom: 48 }}>
                <span className="font-display" style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', tracking: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Authentication</span>
                <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  Tailored views for every colleague
                </h2>
              </div>

              <div className="roles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, alignItems: 'start' }}>
                {ROLES.map((r, i) => {
                  const Icon = r.icon;
                  return (
                    <div key={i} className="role-card" style={{ '--role-accent': r.accent }}>
                      <div className="role-icon-badge">
                        <div className="role-icon-overlay" style={{ background: r.accent }}></div>
                        <Icon />
                      </div>
                      <div className="role-title">{r.name}</div>
                      <div className="role-desc">{r.access}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Social Proof / Testimonials */}
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
            <div style={{ marginBottom: 48 }}>
              <span className="font-display" style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', tracking: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Feedback</span>
              <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                Loved by logistics teams
              </h2>
            </div>

            <div className="marquee-container" style={{ 
              overflow: 'hidden', 
              width: '100vw',
              position: 'relative',
              left: '50%',
              marginLeft: '-50vw',
              maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)', 
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)' 
            }}>
              <div className="marquee-track">
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                  <div key={i} className="testimonial-card">
                    <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                      {[1,2,3,4,5].map(st => (
                        <Star key={st} style={{ width: 18, height: 18, fill: '#E8940C', color: '#E8940C' }} />
                      ))}
                    </div>
                    <p className="testimonial-quote" style={{ fontSize: 15, lineHeight: 1.5, color: '#14181F', marginBottom: 16, flex: 1 }}>
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div>
                      <div className="testimonial-name" style={{ fontSize: 13, fontWeight: 700, color: '#14181F', marginBottom: 2 }}>{t.name}</div>
                      <div className="testimonial-role" style={{ fontSize: 13, color: '#6B7480' }}>{t.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Call to Action with Accounts */}
          <section style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
              <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div className="live-dot"></div>
                    <span className="font-display" style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', tracking: '0.1em', textTransform: 'uppercase', display: 'block' }}>Access</span>
                  </div>
                  <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 16 }}>
                    Explore the live platform
                  </h2>
                  <p className="access-desc" style={{ fontSize: 15, lineHeight: 1.65, color: '#6B7480', marginBottom: 32, maxWidth: 380 }}>
                    Select a workspace credential on the right and check how roles alter access scopes immediately.
                  </p>
                  <Link to="/login" className="btn btn-accent btn-launch-hub">
                    Launch Fleet Hub
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </Link>
                </div>

                {/* Account credentials */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E1E5EB', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 24px', background: '#F1F3F6' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7480', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      DEMO CREDENTIALS <span style={{ opacity: 0.5 }}>—</span> password: <span style={{ fontFamily: 'var(--font-mono)', textTransform: 'none', color: '#14181F' }}>transit123</span>
                    </span>
                  </div>
                  {ROLES.map((r, idx, arr) => {
                    const Icon = r.icon;
                    const emailMap = { 'Fleet Manager': 'fleet', 'Driver': 'driver', 'Safety Officer': 'safety', 'Financial Analyst': 'finance' };
                    const email = `${emailMap[r.name]}@transit.com`;
                    return (
                      <div key={r.name} className="demo-row"
                        style={{ '--row-accent': r.accent, padding: '16px 24px', borderBottom: idx < arr.length - 1 ? '1px solid #E1E5EB' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="badge-bg" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: r.accent, opacity: 0.08, transition: 'opacity 150ms ease-out' }}></div>
                            <Icon style={{ width: 18, height: 18, color: r.accent, position: 'relative', zIndex: 2 }} />
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#14181F' }}>{r.name}</p>
                            <p style={{ fontSize: 13, color: '#6B7480', fontFamily: 'var(--font-mono)' }}>{email}</p>
                          </div>
                        </div>
                        <Link to="/login" className="btn btn-outline demo-btn" style={{ padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 100, borderColor: '#E1E5EB', color: '#14181F', background: 'transparent' }}>
                          Quick Login
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* Upgraded Footer Section */}
        <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', padding: '80px 24px 40px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>
              
              {/* Brand and Description Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck style={{ width: 16, height: 16, color: '#fff', margin: 'auto' }} />
                  </div>
                  <span className="font-display" style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.02em' }}>TransitOps</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: 300 }}>
                  A unified control center for transport operations. We combine real-time telemetry tracking, driver rosters, expense logging, and forecasting.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--text-muted2)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail style={{ width: 14, height: 14 }} /> contact@transitops.app
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone style={{ width: 14, height: 14 }} /> +1 (800) 555-0199
                  </span>
                </div>
              </div>

              {/* Dynamic Link columns */}
              {Object.entries({
                Product: [
                  { label: 'AI Dispatch Advisor', link: '#' },
                  { label: 'Live Telemetry Tracker', link: '#' },
                  { label: 'Financial Cost Reports', link: '#' },
                  { label: 'API Integrations', link: '#' }
                ],
                Colleagues: [
                  { label: 'Fleet Manager Portal', link: '#' },
                  { label: 'Driver Operations', link: '#' },
                  { label: 'Safety Compliance Panel', link: '#' },
                  { label: 'Financial Expense Audits', link: '#' }
                ],
                Resources: [
                  { label: 'User Documentation', link: '#' },
                  { label: 'Help Center Support', link: '#' },
                  { label: 'Privacy Regulations', link: '#' },
                  { label: 'Terms of Use Agreement', link: '#' }
                ]
              }).map(([title, links]) => (
                <div key={title} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', uppercase: 'true', letterSpacing: '0.08em' }}>{title}</h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {links.map(l => (
                      <li key={l.label}>
                        <a href={l.link} style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s, padding-left 0.2s', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          className="foot-link"
                          onMouseEnter={e => { e.target.style.color = 'var(--accent)'; e.target.style.paddingLeft = '4px'; }}
                          onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.paddingLeft = '0px'; }}
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Section */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted2)' }}>
                  © {new Date().getFullYear()} TransitOps Platform. Designed with React + Tailwind CSS.
                </p>
              </div>
              
              {/* Green status indicator badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 20, padding: '6px 14px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 0 2px rgba(16,185,129,0.2)' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>All Systems Operational</span>
              </div>
            </div>

          </div>
        </footer>

      </div>
    </>
  );
}


