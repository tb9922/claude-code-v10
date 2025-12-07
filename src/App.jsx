import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Shield, Target, Brain, Zap, Phone, Users, User, Scale, Clock,
  ChevronRight, ChevronLeft, Check, X, AlertTriangle, RotateCcw, Calculator,
  MessageSquare, Lightbulb, Lock, Award, Crosshair, ThumbsDown, ThumbsUp, ArrowRight, Dices,
  Trophy, Flame, Star, Crown, Keyboard, Calendar, DollarSign, UserX, PhoneOff, FileText, Bookmark,
  Edit3, Save, RotateCw, Network, Plus, Trash2, Move, ZoomIn, ZoomOut, Download, Upload, RefreshCw
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// TITAN PROTOCOL V10 - OPTIMIZED ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════════

// --- CONSTANTS & CONFIG ---
const TIMER_WARNING = 90;
const TIMER_DANGER = 150;
const TIMER_CRITICAL = 180;

const RANKS = [
  { name: "ROOKIE", minXP: 0, icon: User, color: "text-slate-400" },
  { name: "SDR", minXP: 500, icon: Phone, color: "text-blue-400" },
  { name: "CLOSER", minXP: 1500, icon: Target, color: "text-purple-400" },
  { name: "TOP GUN", minXP: 3000, icon: Star, color: "text-amber-400" },
  { name: "TITAN", minXP: 5000, icon: Crown, color: "text-rose-500" }
];

const SCORING = {
  TRANSITION_GREEN: 50,
  TRANSITION_PURPLE: 60,
  TRANSITION_ROSE: 30,
  TRANSITION_BLUE: 40,
  TRANSITION_RED: 20,
  RECOVERY_BONUS: 100,
  DEFENSE_WIN: 25,
  VICTORY: 500
};

const MODES = {
  HOME: 'HOME',
  OUTBOUND: 'OUTBOUND',
  INBOUND: 'INBOUND',
  MEETING: 'MEETING',
  FLOW_EDITOR: 'FLOW_EDITOR'
};

const STAGES = {
  // OUTBOUND FLOW
  GK_CHECK: 'GK_CHECK',
  GK_SCRIPT: 'GK_SCRIPT',
  OPENER: 'OPENER',
  SALVAGE: 'SALVAGE',

  // PHASE 1.5: GAUNTLET
  DISQ_PERMISSION: 'DISQ_PERMISSION',
  DISQ_IDENTITY: 'DISQ_IDENTITY',
  DISQ_PUSH_AWAY: 'DISQ_PUSH_AWAY',
  DISQ_WAIT_REVERSE: 'DISQ_WAIT_REVERSE',
  DISQ_PRICE_ANCHOR: 'DISQ_PRICE_ANCHOR',

  PITCH: 'PITCH',
  PUSH: 'PUSH',
  CHALLENGE: 'CHALLENGE',
  BRIDGE: 'BRIDGE',

  // GRINDER SEQUENCE
  GRINDER_1: 'GRINDER_1',
  GRINDER_2: 'GRINDER_2',
  GRINDER_3: 'GRINDER_3',
  GRINDER_4: 'GRINDER_4',
  GRINDER_5: 'GRINDER_5',
  GRINDER_6: 'GRINDER_6',
  GRINDER_7: 'GRINDER_7',

  BOOK_MEETING: 'BOOK_MEETING',

  // INBOUND FLOW
  INBOUND_HOOK: 'INBOUND_HOOK',
  INBOUND_SOURCE: 'INBOUND_SOURCE',
  INBOUND_TIMING: 'INBOUND_TIMING',
  INBOUND_COMPETITION: 'INBOUND_COMPETITION',
  INBOUND_QUALIFY: 'INBOUND_QUALIFY',

  // MEETING FLOW (OMEGA)
  OMEGA_TIME: 'OMEGA_TIME',
  OMEGA_THEIR_NO: 'OMEGA_THEIR_NO',
  OMEGA_QUESTIONS: 'OMEGA_QUESTIONS',
  OMEGA_YOUR_NO: 'OMEGA_YOUR_NO',
  OMEGA_DECISION: 'OMEGA_DECISION',

  // END STATES
  GAMEOVER: 'GAMEOVER',
  DEBRIEF: 'DEBRIEF',
  VICTORY: 'VICTORY'
};

const PHASE_ORDER = ['ENTRY', 'OPENER', 'RECOVERY', 'GAUNTLET', 'PITCH', 'GRINDER', 'CLOSE', 'INBOUND', 'OMEGA', 'END'];

// --- EMERGENCY EXITS ---
const EMERGENCY_EXITS = [
  { label: "BOOK MEETING", action: STAGES.BOOK_MEETING, icon: Calendar, color: "emerald" },
  { label: "DEAD LEAD", action: STAGES.DEBRIEF, icon: UserX, color: "red" },
  { label: "CALLBACK", action: STAGES.DEBRIEF, icon: Phone, color: "amber" }
];

// --- DEBRIEF REASONS ---
const DEBRIEF_REASONS = {
  PRICE_HIGH: { label: "Price Expectation (8x+)", icon: DollarSign, color: "amber" },
  NOT_READY: { label: "Not Ready (Zombie Lead)", icon: Calendar, color: "blue" },
  NO_PAIN: { label: "No Pain Found", icon: UserX, color: "slate" },
  HUNG_UP: { label: "Hung Up / Rude", icon: PhoneOff, color: "red" },
  GATEKEEPER: { label: "Blocked by Gatekeeper", icon: Shield, color: "purple" },
  VOICEMAIL: { label: "Voicemail / No Answer", icon: Phone, color: "gray" },
  CALLBACK: { label: "Callback Scheduled", icon: Calendar, color: "green" },
};

// --- LOGIC DATABASE ---
const LOGIC_CORE_DEFAULT = {
  [STAGES.GK_CHECK]: {
    label: "Gatekeeper Triage",
    phase: "ENTRY",
    script: { text: "Is there a Gatekeeper (Receptionist/PA) blocking access?", ta: "Adult" },
    options: [
      { label: "Yes, Blocked", action: STAGES.GK_SCRIPT, style: "red" },
      { label: "No, Direct Line", action: STAGES.OPENER, style: "green" }
    ]
  },
  [STAGES.GK_SCRIPT]: {
    label: "Gatekeeper Bypass",
    phase: "ENTRY",
    script: {
      text: "Hi. I'm hoping you can help me? I'm looking for <span class='text-cyan-300'>[NAME]</span>, but I'm not sure if he's the right person to speak to about [Asset/Topic]...",
      note: "Tone: Lost Lamb. Disarm by asking for help.",
      ta: "Natural Child"
    },
    options: [
      { label: "Put Through", action: STAGES.OPENER, style: "green" },
      { label: "Voicemail", action: STAGES.DEBRIEF, note: "Leave 'Cut-off' VM", style: "amber", debriefReason: 'VOICEMAIL' },
      { label: "Blocked/Email", action: STAGES.DEBRIEF, style: "red", debriefReason: 'GATEKEEPER' }
    ]
  },
  [STAGES.OPENER]: {
    label: "The Opener",
    phase: "OPENER",
    variants: [
      { name: "Hate Me? (Yes/No)", text: "Hi <span class='text-cyan-300'>[NAME]</span>. <span class='text-yellow-400'>Would you hate me if I told you this was a cold call?</span>", note: "IF YES: 'Well I won't say that then haha'. IF NO: 'Aha great but I don't have anything to sell, you got 30 seconds so I can elaborate?'", ta: "Rebellious Child" },
      { name: "Upfront Paradox", text: "Hi <span class='text-cyan-300'>[NAME]</span>, I'll be upfront with you. This is a cold call but I don't have anything to sell you. <span class='text-yellow-400'>Would you like to hang up now, or give me 30 seconds and then decide?</span>", ta: "Adult" },
      { name: "Hang Up?", text: "Hi <span class='text-cyan-300'>[NAME]</span>, it's [Your Name]... if I told you this was a cold call about the business <span class='text-yellow-400'>would you hang up on me?</span>", ta: "Adult" },
      { name: "Hate + Nothing", text: "<span class='text-cyan-300'>[NAME]</span>, you're going to hate me... this is a cold call but I have nothing to sell. <span class='text-yellow-400'>Do you want to hang up on me now or give me 30 sec to tell you why I called?</span>", ta: "Rebellious Child" },
      { name: "Die Inside", text: "Hi <span class='text-cyan-300'>[NAME]</span>, it's [Your Name]. If I told you this was a cold call about the business <span class='text-yellow-400'>would a little piece of you die inside?</span> Haha.", ta: "Natural Child" }
    ],
    options: [
      { label: "They Listen / Laugh", action: STAGES.PITCH, style: "green" },
      { label: "⚔️ Run Gauntlet", action: STAGES.DISQ_PERMISSION, style: "purple", bonus: true },
      { label: "Yes / Hate You", action: STAGES.SALVAGE, style: "red" },
      { label: "Hang Up", action: STAGES.DEBRIEF, style: "gray", debriefReason: 'HUNG_UP' }
    ]
  },
  [STAGES.SALVAGE]: {
    label: "The Salvage",
    phase: "RECOVERY",
    variants: [
      { name: "Buyer Identity Pivot", text: "That's fair. But... if I told you I'm a buyer looking to write a check, not a broker looking for a fee... <span class='text-yellow-400'>do you still want to hang up?</span>", note: "Use when they ask 'What do you want?' or are annoyed.", ta: "Adult (Contrast)" },
      { name: "Problem Solver", text: "I get that. But if the reason I'm calling is to buy the problems that are causing you that stress... <span class='text-yellow-400'>would I still be the bad guy?</span>", note: "Use if they sound tired or stressed.", ta: "Nurturing Parent" },
      { name: "Money Hook", text: "You can hang up. But you might be hanging up on the only person calling you today who wants to give you money, not take it. <span class='text-yellow-400'>Your call.</span>", note: "Use if they are rude or say 'I don't have time'.", ta: "Rebellious Child" },
      { name: "Entertainment Bargain", text: "Wait—I promise to be the most interesting cold call you get today. <span class='text-yellow-400'>If I bore you in 30 seconds, you can block my number. Deal?</span>", note: "Use if they are dismissive or bored.", ta: "Natural Child" }
    ],
    options: [
      { label: "Curious / Go On", action: STAGES.PITCH, style: "green", bonus: true },
      { label: "⚔️ Run Gauntlet", action: STAGES.DISQ_PERMISSION, style: "purple" },
      { label: "Still No", action: STAGES.DEBRIEF, style: "red", debriefReason: 'HUNG_UP' }
    ]
  },
  // --- PHASE 1.5: GAUNTLET ---
  [STAGES.DISQ_PERMISSION]: {
    label: "Gauntlet 0: The Qualifier",
    phase: "GAUNTLET",
    script: { text: "Quick check before we go on - <span class='text-purple-300'>would you like to know a bit more about who we are and what we do?</span>", ta: "Adult" },
    options: [
      { label: "Yes (They Bite)", action: STAGES.DISQ_IDENTITY, style: "green" },
      { label: "No / Not Interested", action: STAGES.DEBRIEF, style: "red", debriefReason: 'NOT_READY' }
    ]
  },
  [STAGES.DISQ_IDENTITY]: {
    label: "Gauntlet 1: Identity Anchor",
    phase: "GAUNTLET",
    script: { text: "Very quickly: We are Operator-Buyers, not Brokers. Zero fees. We don't list publicly. <br/><br/>We buy to keep it running. <span class='text-purple-300'>So your staff and residents stay exactly where they are.</span>", ta: "Adult" },
    options: [{ label: "Next Step (Push Away)", action: STAGES.DISQ_PUSH_AWAY, style: "purple" }]
  },
  [STAGES.DISQ_PUSH_AWAY]: {
    label: "Gauntlet 2: The Reset",
    phase: "GAUNTLET",
    script: { text: "Now... I've had my 30 seconds. <br/><br/>But honestly <span class='text-cyan-300'>[NAME]</span>, listening to you... I get the feeling you don't actually need to sell, and <span class='text-orange-300'>you're quite happy running this place for another 10 years?</span>", ta: "Nurturing Parent" },
    options: [
      { label: "No, I can't do 10 years", action: STAGES.DISQ_WAIT_REVERSE, style: "green" },
      { label: "Yes, I'm happy", action: STAGES.DEBRIEF, style: "red", debriefReason: 'NOT_READY' }
    ]
  },
  [STAGES.DISQ_WAIT_REVERSE]: {
    label: "Gauntlet 3: The Wait Reverse",
    phase: "GAUNTLET",
    script: { text: "I hear you. But the market is terrible right now. Inflation up, fees flat. <br/><br/><span class='text-orange-300'>Why not just hold on for another 3 years, wait for the next government, and sell then?</span> Why urgency NOW?", ta: "Adult" },
    options: [
      { label: "I can't wait / Burnout", action: STAGES.DISQ_PRICE_ANCHOR, style: "green", captureAs: "urgency" },
      { label: "I can wait (Zombie Lead)", action: STAGES.DEBRIEF, style: "amber", debriefReason: 'NOT_READY' }
    ]
  },
  [STAGES.DISQ_PRICE_ANCHOR]: {
    label: "Gauntlet 4: The Price Killer",
    phase: "GAUNTLET",
    script: { text: "Okay. But I need to be brutally honest. <br/>We buy based on today's actual profit, not 'future potential.' Banks lend at 3-5x profit. That is market reality. <br/><br/><span class='text-red-400'>If you are holding out for a 'Lottery Ticket' price... are we miles apart, or in the same universe?</span>", ta: "Critical Parent" },
    options: [
      { label: "Same Universe", action: STAGES.BOOK_MEETING, style: "green", bonus: true },
      { label: "Miles Apart (8x+)", action: STAGES.DEBRIEF, style: "red", debriefReason: 'PRICE_HIGH' }
    ]
  },
  // --- PITCH ---
  [STAGES.PITCH]: {
    label: "The Pitch",
    phase: "PITCH",
    variants: [
      { name: "The Classic (Agency/CQC)", text: "We talk to many care home owners like you. <br/><br/>They tell us they're frustrated with <span class='text-purple-300'>Agency costs</span> spiraling... <br/>Others tell us they're worried about the next <span class='text-purple-300'>CQC inspection</span>... <br/>And honestly, some are just <span class='text-purple-300'>disillusioned</span> and tired, but don't know how to exit safely.", ta: "Adult-Adult" },
      { name: "Margin Squeeze (Inflation)", text: "We typically work with owners in the sector. <br/><br/>They tell us they're frustrated with <span class='text-purple-300'>Food and Energy inflation</span> eating all the margin... <br/>Others tell us they're worried that <span class='text-purple-300'>LA fees</span> aren't keeping up... <br/>And honestly, some are just <span class='text-purple-300'>scared</span> that they are working harder today for less profit.", ta: "Adult-Adult" },
      { name: "Operational (Burnout)", text: "I usually speak to owners like yourself. <br/><br/>They tell us they're frustrated with <span class='text-purple-300'>unreliable Agency Staff</span>... <br/>Others tell us they're worried about putting their <span class='text-purple-300'>License at risk</span>... <br/>And honestly, some are just <span class='text-purple-300'>burnt out</span> from working 70-hour weeks covering shifts.", ta: "Nurturing Parent" },
      { name: "Legacy (Vulture Defense)", text: "We're usually invited in by owners looking to retire. <br/><br/>They tell us they're frustrated with <span class='text-purple-300'>Brokers</span> promising high prices that never materialize... <br/>Others tell us they're worried about selling to a <span class='text-purple-300'>Corporate Vulture</span>... <br/>And honestly, some just want to protect their <span class='text-purple-300'>Legacy</span>.", ta: "Adult-Adult" }
    ],
    options: [{ label: "Deliver Pitch", action: STAGES.PUSH, style: "blue" }]
  },
  [STAGES.PUSH]: {
    label: "The Negative Reverse",
    phase: "PITCH",
    script: { text: "However... I get the feeling that <span class='text-orange-300'>none of these are relevant to you</span> and everything is running perfectly?", ta: "Nurturing Parent" },
    options: [
      { label: "They Admit Pain", action: STAGES.BRIDGE, style: "green", captureAs: "pain" },
      { label: "They say 'It is Perfect'", action: STAGES.CHALLENGE, style: "red" }
    ]
  },
  [STAGES.CHALLENGE]: {
    label: "The Challenge",
    phase: "PITCH",
    variants: [
      { name: "Hang Up Push", text: "Really? You have **zero agency** and **25% margins**? <br/><br/>(Pause). <br/><br/>David, if that's true, you're the only home in the UK with that problem solved. So... <span class='text-red-400'>why haven't you hung up on me yet?</span>", ta: "Rebellious Child" },
      { name: "Walk Away", text: "So despite inflation and the CQC, everything is absolutely perfect? <br/><br/>(Pause). <br/><br/>Well, in that case, I definitely can't help you. <span class='text-red-400'>So we should probably just hang up then, shouldn't we?</span>", ta: "Adult-Adult" },
      { name: "Polite Check", text: "Everything is perfect? <br/><br/>(Long Pause). <br/><br/>David, usually when owners tell me that, they're just saying it to be polite to get me off the phone. <span class='text-orange-400'>Is that what's happening here?</span>", ta: "Nurturing Parent" },
      { name: "Consultant Reverse", text: "You've cracked the code? Zero staffing issues, max profit? <br/><br/>Then honestly, you don't need a buyer. <span class='text-red-400'>I should be hiring YOU as a consultant.</span> <br/><br/>Shall we end the call so you can get back to counting the money?", ta: "Rebellious Child" }
    ],
    options: [
      { label: "They Crack (Admit Pain)", action: STAGES.BRIDGE, style: "green", bonus: true, captureAs: "pain" },
      { label: "Double Down (Bye)", action: STAGES.DEBRIEF, style: "red", debriefReason: 'NO_PAIN' }
    ]
  },
  [STAGES.BRIDGE]: {
    label: "The Bridge",
    phase: "GRINDER",
    script: { text: "I see. Look, I've had my 20 seconds. <span class='text-cyan-300'>Do you mind if we take 2 minutes</span> to unpack that properly?", ta: "Adult" },
    options: [{ label: "Enter The Grinder", action: STAGES.GRINDER_1, style: "rose" }]
  },
  // --- GRINDER SEQUENCE ---
  [STAGES.GRINDER_1]: { label: "Grinder 1: Specifics", phase: "GRINDER", script: { text: "You mentioned [Pain]. <span class='text-rose-300'>Can you give me a specific example of when that happened recently?</span>", ta: "Adult" }, hasCapture: true, captureField: "specificExample", options: [{ label: "Got Example", action: STAGES.GRINDER_2, style: "rose" }] },
  [STAGES.GRINDER_2]: { label: "Grinder 2: Duration", phase: "GRINDER", script: { text: "How long has that been a problem? <span class='text-rose-300'>Months? Years?</span>", ta: "Adult" }, hasCapture: true, captureField: "duration", options: [{ label: "Got Duration", action: STAGES.GRINDER_3, style: "rose" }] },
  [STAGES.GRINDER_3]: { label: "Grinder 3: Attempts", phase: "GRINDER", script: { text: "What have you tried to fix it? <span class='text-rose-300'>Surely you haven't just sat there and watched it happen?</span>", ta: "Natural Child" }, hasCapture: true, captureField: "attemptedFix", options: [{ label: "They Tried X", action: STAGES.GRINDER_4, style: "rose" }] },
  [STAGES.GRINDER_4]: { label: "Grinder 4: Failure", phase: "GRINDER", script: { text: "And did that work? <span class='text-rose-300'>(Wait for 'No')</span>. I didn't think so.", ta: "Adult" }, options: [{ label: "Confirmed Failure", action: STAGES.GRINDER_5, style: "rose" }] },
  [STAGES.GRINDER_5]: { label: "Grinder 5: Cost", phase: "GRINDER", script: { text: "What is this costing you? <span class='text-rose-300'>Put a number on it for me.</span>", ta: "Adult" }, hasInput: true, inputField: "monthlyCost", options: [{ label: "Pain Quantified", action: STAGES.GRINDER_6, style: "rose" }] },
  [STAGES.GRINDER_6]: { label: "Grinder 6: Emotion", phase: "GRINDER", script: { text: "Money aside... <span class='text-rose-300'>how is this impacting you personally?</span> Stress? Sleep?", ta: "Nurturing Parent" }, hasCapture: true, captureField: "emotionalImpact", options: [{ label: "Found Emotion", action: STAGES.GRINDER_7, style: "rose" }] },
  [STAGES.GRINDER_7]: { label: "Grinder 7: Given Up?", phase: "GRINDER", script: { text: "Be honest. <span class='text-rose-300'>Have you given up trying to fix this?</span>", ta: "Critical Parent" }, options: [{ label: "No (Ready to fix)", action: STAGES.BOOK_MEETING, style: "green" }, { label: "Yes (Given up)", action: STAGES.DEBRIEF, style: "red", debriefReason: 'NOT_READY' }] },

  [STAGES.BOOK_MEETING]: { label: "The Vampire Close", phase: "CLOSE", script: { text: "I don't know if we can buy this asset. But <span class='text-green-400'>let's pretend</span> we could structure a deal... Is there any reason you wouldn't <span class='text-green-400 font-bold'>invite me in</span> for a 45-minute audit?", ta: "Adult" }, options: [{ label: "Meeting Booked!", action: STAGES.VICTORY, style: "green" }, { label: "They Decline", action: STAGES.DEBRIEF, style: "red", debriefReason: 'NOT_READY' }] },

  // --- INBOUND FLOW ---
  [STAGES.INBOUND_HOOK]: { label: "Inbound: Initial Hook", phase: "INBOUND", script: { text: "Thanks for reaching out.<br/>Before we dive in — <span class='text-emerald-300'>what specifically prompted you to contact us today?</span>", ta: "Adult" }, hasCapture: true, captureField: "inboundReason", options: [{ label: "Got Reason", action: STAGES.INBOUND_SOURCE, style: "green" }] },
  [STAGES.INBOUND_SOURCE]: { label: "Inbound: Lead Source", phase: "INBOUND", script: { text: "Interesting. <span class='text-emerald-300'>How did you hear about us?</span><br/>Referral? Online? Event?", ta: "Adult" }, hasCapture: true, captureField: "leadSource", options: [{ label: "Got Source", action: STAGES.INBOUND_TIMING, style: "green" }] },
  [STAGES.INBOUND_TIMING]: { label: "Inbound: Timing Check", phase: "INBOUND", script: { text: "What's your <span class='text-emerald-300'>timeline</span> looking like?<br/>Are you exploring options, or do you need to move on something?", ta: "Adult" }, hasCapture: true, captureField: "timeline", options: [{ label: "Urgent (Hot)", action: STAGES.INBOUND_COMPETITION, style: "green" }, { label: "Exploring (Warm)", action: STAGES.INBOUND_COMPETITION, style: "amber" }, { label: "Just Looking (Cold)", action: STAGES.DEBRIEF, style: "gray", debriefReason: 'NOT_READY' }] },
  [STAGES.INBOUND_COMPETITION]: { label: "Inbound: Competition", phase: "INBOUND", script: { text: "Have you <span class='text-emerald-300'>spoken to anyone else</span> about this?<br/>Brokers? Other buyers?", ta: "Adult" }, hasCapture: true, captureField: "competition", options: [{ label: "No Competition", action: STAGES.INBOUND_QUALIFY, style: "green" }, { label: "Yes, Others", action: STAGES.INBOUND_QUALIFY, style: "amber" }] },
  [STAGES.INBOUND_QUALIFY]: { label: "Inbound: Quick Qualify", phase: "INBOUND", script: { text: "Quick sanity check on numbers...<br/>Ballpark: what's the <span class='text-emerald-300'>annual profit</span> looking like?<br/>And do you have a <span class='text-emerald-300'>number in mind</span> that would make you move?", ta: "Adult" }, hasCapture: true, captureField: "inboundNumbers", options: [{ label: "Numbers Work → Meeting", action: STAGES.BOOK_MEETING, style: "green" }, { label: "Too High → Educate", action: STAGES.DISQ_PRICE_ANCHOR, style: "amber" }, { label: "Won't Share", action: STAGES.DEBRIEF, style: "red", debriefReason: 'HUNG_UP' }] },

  // --- OMEGA LOGIC ---
  [STAGES.OMEGA_TIME]: { label: "Omega 1: Time", phase: "OMEGA", script: { text: "We set aside 45 mins. <span class='text-purple-300'>Is that a hard stop?</span>", ta: "Adult" }, options: [{label: "Confirmed", action: STAGES.OMEGA_THEIR_NO, style: "purple"}] },
  [STAGES.OMEGA_THEIR_NO]: { label: "Omega 2: Their No", phase: "OMEGA", script: { text: "If you don't like what you see, <span class='text-purple-300'>will you promise to tell me 'No'?</span>", ta: "Adult" }, options: [{label: "Agreed", action: STAGES.OMEGA_QUESTIONS, style: "purple"}] },
  [STAGES.OMEGA_QUESTIONS]: { label: "Omega 3: Questions", phase: "OMEGA", script: { text: "I'm going to ask tough questions. <span class='text-purple-300'>Is that okay?</span>", ta: "Adult" }, options: [{label: "Agreed", action: STAGES.OMEGA_YOUR_NO, style: "purple"}] },
  [STAGES.OMEGA_YOUR_NO]: { label: "Omega 4: My No", phase: "OMEGA", script: { text: "If I can't help, <span class='text-purple-300'>I'll tell you straight</span> so I don't waste your time.", ta: "Adult" }, options: [{label: "Agreed", action: STAGES.OMEGA_DECISION, style: "purple"}] },
  [STAGES.OMEGA_DECISION]: { label: "Omega 5: Decision", phase: "OMEGA", script: { text: "At the end, we need a decision. <span class='text-purple-300'>Yes or No. No 'Think it overs'.</span> Deal?", ta: "Adult" }, options: [{label: "Contract Locked", action: STAGES.VICTORY, style: "green"}] },

  // --- END STATES ---
  [STAGES.DEBRIEF]: { label: "Call Debrief", phase: "END", script: { text: "What happened? <span class='text-slate-400'>Log it for analytics.</span>", ta: "System" }, isDebrief: true, options: Object.entries(DEBRIEF_REASONS).map(([key, val], i) => ({ label: val.label, action: STAGES.GAMEOVER, style: val.color, debriefReason: key })) },
  [STAGES.VICTORY]: { label: "VICTORY", phase: "END", script: { text: "MISSION COMPLETE. Status Preserved. Next Step Locked.", ta: "System" }, options: [{ label: "New Call", action: 'RESET', style: "gray" }] },
  [STAGES.GAMEOVER]: { label: "Call Ended", phase: "END", script: { text: "They Disqualified Themselves. You maintained status. <span class='text-red-400'>Next Call.</span>", ta: "System" }, options: [{ label: "New Call", action: 'RESET', style: "gray" }] }
};

// --- FULL DEFENSE MATRIX (DEFAULT DATA) ---
const DEFENSE_CATEGORIES = {
  CREDIBILITY: {
    id: "CREDIBILITY", label: "Trust & Credibility", color: "blue",
    items: [
      { id: "CLOSED_DEAL", title: "Have you closed before?", script: "Fair question. Are you worried I'm using your deal as 'practice', or that I'll disappear if paperwork gets messy?", adjustment: "Challenge the implication." },
      { id: "AGE", title: "You sound young", script: "I get that a lot. Are you concerned about my age, or asking if I have the financial backing and board experience to get this done?", adjustment: "Youth vs Experience pivot." },
      { id: "TRUST_WORK", title: "Trust with my life's work", script: "Big question. By 'trust', do you mean financially (getting paid) or emotionally (not ruining the culture)?", adjustment: "Separate Financial vs Emotional." },
      { id: "NOT_CORPORATE", title: "Not usual corporate buyer", script: "You're right. But tell me... is that a good thing in your mind, or does it make you more nervous?", adjustment: "Badge of honor." },
      { id: "REGULATED", title: "Are you regulated?", script: "Fair point. Is your concern about whose name goes on the CQC registration, or that I personally don't know how to run the operation?", adjustment: "Manager vs Owner role." },
      { id: "FAILURE", title: "What if it fails?", script: "That's why we don't buy 'turnarounds'. We keep existing management. Plus, with seller financing, our interests are aligned—we MUST keep it profitable to pay you. We also have a Board to prevent failure. Shall I explain our oversight?", adjustment: "Alignment + Governance." }
    ]
  },
  MONEY: {
    id: "MONEY", label: "Money & Funding", color: "emerald",
    items: [
      { id: "HAVE_MONEY", title: "Do you have money?", script: "You're right to be suspicious. Have you had buyers mess you around with 'funding' that never materialized?", adjustment: "Agree with suspicion." },
      { id: "GUARANTEE", title: "Who is guaranteeing?", script: "Good question. To make you safe, would you need a personal guarantee, proof of funds, or bank credit approval?", adjustment: "Offer options." },
      { id: "LBO", title: "Using my business to pay?", script: "Sharp question. Are you against leverage on principle, or worried the structure puts you at risk if we default?", adjustment: "Don't flinch." },
      { id: "LENDER_NO", title: "If lender says no?", script: "Sounds like you've seen that movie before. If that happened, what backup plan would you expect a serious buyer to have?", adjustment: "Validate trauma." },
      { id: "SKIN_GAME", title: "How much cash from you?", script: "Happy to answer. But is that about seeing 'skin-in-the-game', or testing if I'm just brokering this?", adjustment: "Broker test." }
    ]
  },
  INTENT: {
    id: "INTENT", label: "Intent & Character", color: "amber",
    items: [
      { id: "VULTURE", title: "Are you a vulture?", script: "I'm okay if you see me that way for now. Can I ask – what horror stories have you heard from other sellers?", adjustment: "Negative push." },
      { id: "SLASH_STAFF", title: "Slash staff?", script: "That's a heavy worry. Is the fear that I'll cut corners on care, or that your loyal staff will be treated like costs?", adjustment: "Identify specific fear." },
      { id: "BIG_GROUP", title: "Why not big group?", script: "Good question. Before I try and justify myself – honestly, what do you think you're getting from a big corporate group that someone like me can't give you?", adjustment: "Make them pitch you." },
      { id: "FLIP", title: "Just going to flip it?", script: "Maybe. Does that bother you because of what happens to residents, or because you'd leave money on the table?", adjustment: "Be honest (Status)." },
      { id: "COMPETITORS", title: "Talking to competitors?", script: "I am. When you ask that – are you worried I'll play you off against each other, or that I'll leak info?", adjustment: "Market research frame." }
    ]
  },
  PRICE: {
    id: "PRICE", label: "Price & Terms", color: "purple",
    items: [
      { id: "OFFER", title: "What's your offer?", script: "Right now it would be a guess. Are you looking for the theoretically highest number, or the number that actually completes?", adjustment: "Refuse to dance." },
      { id: "HIGHER_OFFER", title: "Had higher offer", script: "You probably have. So I'm confused – if theirs is higher, why haven't you signed? Why are we still talking?", adjustment: "Confusion play." },
      { id: "NO_EARNOUT", title: "No earn-out", script: "Understood. Is that because you've been burned by one before, or because you don't trust anyone to run it without you?", adjustment: "Find the wound." },
      { id: "NO_RUSH", title: "In no rush", script: "Maybe I'm too early. What would have to change for this to move from 'no rush' to 'need to do something'?", adjustment: "The Takeaway." },
      { id: "BEST_FINAL", title: "Best and final", script: "I can do that. But if I do – are you in a position to give me a clean 'Yes/No', or just adding me to a beauty parade?", adjustment: "Beauty parade check." }
    ]
  },
  TIMING: {
    id: "TIMING", label: "Timing & Resistance", color: "cyan",
    items: [
      { id: "WHY_NOW", title: "Why calling now?", script: "That's fair. Is it that the timing feels bad because things are calm, or that you're exhausted and don't want to think about a sale?", adjustment: "Empathy + Logic." },
      { id: "DONT_KNOW", title: "Don't know if I want to sell", script: "Then honestly, David, you probably shouldn't. What's the part of you that doesn't want to sell afraid of losing?", adjustment: "Push away." },
      { id: "BAD_EXP", title: "Bad broker experience", script: "Sounds like that stings. Was it the money lost, time wasted, or how they handled your staff?", adjustment: "Isolate pain." },
      { id: "TOO_MUCH", title: "Too much to talk about", script: "You're right. But before we park it – is your hesitation about time, or opening up a can of worms?", adjustment: "Check for stall." }
    ]
  },
  HOSTILITY: {
    id: "HOSTILITY", label: "Hostility & Status", color: "red",
    items: [
      { id: "IMPORTANT", title: "Why are you important?", script: "I'm not sure I am. Are you testing if I'll grovel, or testing if I'll stay calm when pushed?", adjustment: "Calm, low tone." },
      { id: "TYRE_KICKER", title: "Are you a tyre-kicker?", script: "You sound like you've had a few. What would someone have to show you to believe they aren't one?", adjustment: "Validate frustration." },
      { id: "TONE", title: "Don't like your tone", script: "That's useful. Honestly, what did you pick up – too pushy, too casual? I don't want to show up the wrong way.", adjustment: "Break frame." },
      { id: "INTERROGATION", title: "Stop asking questions", script: "You're right. Does it feel like I'm interrogating you, or that you're giving info without getting value back?", adjustment: "Interrogation check." },
      { id: "WHY_ANSWER", title: "Why should I answer?", script: "That's fair. But if I just threw a random offer without understanding the home – would you trust it?", adjustment: "Logic check." },
      { id: "DONT_BELIEVE", title: "Don't believe you", script: "That's fair – you've only just met me. What would you need to see to start believing?", adjustment: "Lean into negative." }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SEPARATED COMPONENTS (Performance Optimization)
// ═══════════════════════════════════════════════════════════════════════════════

const FlowEditor = ({ logic, setLogic }) => {
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragNodeId, setDragNodeId] = useState(null);

    // Auto-layout on first load if missing coordinates
    useEffect(() => {
        let hasChanges = false;
        const newLogic = { ...logic };

        Object.keys(newLogic).forEach((key) => {
            if (newLogic[key].x === undefined) {
                const phaseIdx = PHASE_ORDER.indexOf(newLogic[key].phase);
                const itemsInPhase = Object.values(newLogic).filter(n => n.phase === newLogic[key].phase);
                const itemIdx = itemsInPhase.findIndex(n => n === newLogic[key] || (n.label === newLogic[key].label));
                newLogic[key].x = phaseIdx * 400 + 100;
                newLogic[key].y = itemIdx * 250 + 100;
                hasChanges = true;
            }
        });

        if (hasChanges) setLogic(newLogic);
    }, []); // Only run once

    // Canvas Events
    const handleMouseDown = (e) => {
        if (e.target.closest('.node-drag-handle')) return;
        setIsPanning(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e) => {
        if (isPanning) {
            setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
        if (isDragging && dragNodeId) {
            const dx = (e.clientX - dragStart.x) / scale;
            const dy = (e.clientY - dragStart.y) / scale;
            setLogic(prev => ({
                ...prev,
                [dragNodeId]: {
                    ...prev[dragNodeId],
                    x: prev[dragNodeId].x + dx,
                    y: prev[dragNodeId].y + dy
                }
            }));
            setDragStart({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        setIsDragging(false);
        setDragNodeId(null);
    };

    const handleNodeMouseDown = (e, id) => {
        e.stopPropagation();
        setSelectedNodeId(id);
        setIsDragging(true);
        setDragNodeId(id);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const createNewNode = () => {
      const id = `CUSTOM_${Date.now()}`;
      setLogic(prev => ({
        ...prev,
        [id]: {
          label: "New Stage",
          phase: "OPENER",
          script: { text: "Edit this script...", ta: "Adult" },
          options: [],
          x: (-offset.x + 300) / scale,
          y: (-offset.y + 300) / scale
        }
      }));
      setSelectedNodeId(id);
    };

    const updateNode = (id, field, value) => {
      setLogic(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    };

    const updateScript = (id, text, ta) => {
       setLogic(prev => ({ ...prev, [id]: { ...prev[id], script: { ...prev[id].script, text, ta } } }));
    };

    // Variant Management
    const convertToVariants = (id) => {
      const node = logic[id];
      if (node.variants) return; // Already has variants
      const currentScript = node.script || { text: "", ta: "Adult" };
      setLogic(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          variants: [{ name: "Variant 1", text: currentScript.text, ta: currentScript.ta }],
          script: undefined
        }
      }));
    };

    const convertToSingleScript = (id) => {
      const node = logic[id];
      if (!node.variants) return; // Already single script
      const firstVariant = node.variants[0] || { text: "", ta: "Adult" };
      setLogic(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          script: { text: firstVariant.text, ta: firstVariant.ta, note: firstVariant.note },
          variants: undefined
        }
      }));
    };

    const addVariant = (id) => {
      setLogic(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          variants: [...(prev[id].variants || []), { name: "New Variant", text: "Edit script here...", ta: "Adult" }]
        }
      }));
    };

    const updateVariant = (id, idx, field, value) => {
      const newVariants = [...logic[id].variants];
      newVariants[idx] = { ...newVariants[idx], [field]: value };
      setLogic(prev => ({ ...prev, [id]: { ...prev[id], variants: newVariants } }));
    };

    const removeVariant = (id, idx) => {
      const newVariants = logic[id].variants.filter((_, i) => i !== idx);
      if (newVariants.length === 0) {
        convertToSingleScript(id);
      } else {
        setLogic(prev => ({ ...prev, [id]: { ...prev[id], variants: newVariants } }));
      }
    };

    const addOption = (id) => {
      setLogic(prev => ({
        ...prev,
        [id]: { ...prev[id], options: [...(prev[id].options || []), { label: "New Option", action: "OPENER", style: "blue" }] }
      }));
    };

    const updateOption = (nodeId, idx, field, value) => {
      const newOptions = [...logic[nodeId].options];
      newOptions[idx] = { ...newOptions[idx], [field]: value };
      setLogic(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], options: newOptions } }));
    };

    const removeOption = (nodeId, idx) => {
      const newOptions = logic[nodeId].options.filter((_, i) => i !== idx);
      setLogic(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], options: newOptions } }));
    };

    const deleteNode = (id) => {
        if (confirm("Delete this stage?")) {
            const newLogic = { ...logic };
            delete newLogic[id];
            setLogic(newLogic);
            setSelectedNodeId(null);
        }
    };

    const downloadLogic = () => {
        const element = document.createElement("a");
        const file = new Blob([JSON.stringify(logic)], {type: 'application/json'});
        element.href = URL.createObjectURL(file);
        element.download = "titan_logic.json";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    };

    const uploadLogic = (e) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = e => {
            setLogic(JSON.parse(e.target.result));
        };
    };

    const resetToDefaults = () => {
        if (confirm("Reset all stages to default? This will delete all your custom changes and cannot be undone.")) {
            setLogic(LOGIC_CORE_DEFAULT);
            setSelectedNodeId(null);
        }
    };

    return (
      <div className="flex h-full bg-slate-950 text-white overflow-hidden relative">
        <div
            className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing bg-slate-900 relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
                backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                backgroundPosition: `${offset.x}px ${offset.y}px`
            }}
        >
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-2 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700"><ZoomIn size={20}/></button>
                <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="p-2 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700"><ZoomOut size={20}/></button>
                <button onClick={createNewNode} className="px-4 py-2 bg-blue-600 rounded border border-blue-500 hover:bg-blue-500 text-sm font-bold flex items-center gap-2"><Plus size={16}/> New Stage</button>
            </div>

            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button onClick={resetToDefaults} className="px-4 py-2 bg-red-600/80 rounded border border-red-500 hover:bg-red-500 text-sm font-bold flex items-center gap-2"><RefreshCw size={16}/> Reset to Defaults</button>
                <button onClick={downloadLogic} className="px-4 py-2 bg-emerald-600/80 rounded border border-emerald-500 hover:bg-emerald-500 text-sm font-bold flex items-center gap-2"><Download size={16}/> Save Logic</button>
                <label className="px-4 py-2 bg-slate-700 rounded border border-slate-600 hover:bg-slate-600 text-sm font-bold flex items-center gap-2 cursor-pointer">
                    <Upload size={16}/> Load JSON
                    <input type="file" onChange={uploadLogic} className="hidden" />
                </label>
            </div>

            <div style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: '0 0', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <svg className="absolute top-0 left-0 w-[50000px] h-[50000px] pointer-events-none" style={{ overflow: 'visible' }}>
                    {Object.entries(logic).map(([id, node]) =>
                        node.options?.map((opt, i) => {
                            const target = logic[opt.action];
                            if (!target) return null;
                            const startX = (node.x || 0) + 280;
                            const startY = (node.y || 0) + 50 + (i * 30);
                            const endX = target.x || 0;
                            const endY = (target.y || 0) + 40;

                            const controlPoint1X = startX + 100;
                            const controlPoint1Y = startY;
                            const controlPoint2X = endX - 100;
                            const controlPoint2Y = endY;

                            return (
                                <path
                                    key={`${id}-${i}`}
                                    d={`M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`}
                                    stroke={opt.style === 'green' ? '#10b981' : opt.style === 'red' ? '#ef4444' : '#3b82f6'}
                                    strokeWidth="2"
                                    fill="none"
                                    opacity="0.6"
                                />
                            );
                        })
                    )}
                </svg>

                {Object.entries(logic).map(([id, node]) => (
                    <div
                        key={id}
                        onMouseDown={(e) => handleNodeMouseDown(e, id)}
                        style={{ transform: `translate(${node.x || 0}px, ${node.y || 0}px)` }}
                        className={`absolute w-72 rounded-xl border-2 shadow-xl bg-slate-900 node-drag-handle transition-shadow ${
                            selectedNodeId === id
                            ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] z-10'
                            : 'border-slate-800 shadow-black'
                        }`}
                    >
                        <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 rounded-t-xl cursor-move">
                            <span className="font-bold text-xs text-slate-300 uppercase tracking-wider">{node.phase}</span>
                            <Move size={12} className="text-slate-600"/>
                        </div>
                        <div className="p-4">
                            <div className="font-bold text-sm text-white mb-2">{node.label}</div>
                            <div className="text-[10px] text-slate-500 line-clamp-2 font-mono mb-3 bg-slate-950 p-2 rounded border border-slate-800">
                                {node.script?.text?.replace(/<[^>]*>?/gm, '')}
                            </div>
                            <div className="space-y-1">
                                {node.options?.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[10px] text-slate-400">
                                        <div className={`w-2 h-2 rounded-full bg-${opt.style === 'green' ? 'emerald' : opt.style === 'red' ? 'red' : 'blue'}-500`}></div>
                                        <span className="truncate">{opt.label}</span>
                                        <ArrowRight size={10} className="ml-auto opacity-50"/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className={`w-80 bg-slate-900 border-l border-slate-800 flex flex-col transition-all duration-300 ${selectedNodeId ? 'translate-x-0' : 'translate-x-full absolute right-0 h-full'}`}>
           {selectedNodeId && logic[selectedNodeId] ? (
             <div className="flex flex-col h-full z-20 bg-slate-900">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <h3 className="font-bold text-slate-200 flex items-center gap-2"><Edit3 size={16}/> Edit Stage</h3>
                    <button onClick={() => deleteNode(selectedNodeId)} className="text-red-400 hover:bg-red-900/30 p-2 rounded"><Trash2 size={16}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase">Label</label>
                        <input
                            value={logic[selectedNodeId].label}
                            onChange={(e) => updateNode(selectedNodeId, 'label', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase">Phase</label>
                        <select
                            value={logic[selectedNodeId].phase}
                            onChange={(e) => updateNode(selectedNodeId, 'phase', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:border-blue-500 outline-none"
                        >
                            {PHASE_ORDER.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    {/* Script / Variants Section */}
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-500 uppercase">
                                {logic[selectedNodeId].variants ? 'Script Variants' : 'Script (HTML)'}
                            </label>
                            {!logic[selectedNodeId].variants ? (
                                <button
                                    onClick={() => convertToVariants(selectedNodeId)}
                                    className="text-[10px] bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded flex items-center gap-1"
                                    title="Convert to multiple variant scripts"
                                >
                                    <Plus size={12}/> Add Variants
                                </button>
                            ) : (
                                <button
                                    onClick={() => convertToSingleScript(selectedNodeId)}
                                    className="text-[10px] bg-slate-600 hover:bg-slate-500 px-2 py-1 rounded flex items-center gap-1"
                                    title="Convert back to single script"
                                >
                                    Single Script
                                </button>
                            )}
                        </div>

                        {/* Single Script Mode */}
                        {!logic[selectedNodeId].variants && (
                            <div className="space-y-2">
                                <textarea
                                    value={logic[selectedNodeId].script?.text || ""}
                                    onChange={(e) => updateScript(selectedNodeId, e.target.value, logic[selectedNodeId].script?.ta || "Adult")}
                                    className="w-full h-32 bg-slate-800 border border-slate-700 rounded p-2 text-xs font-mono focus:border-blue-500 outline-none resize-none leading-relaxed"
                                    placeholder="Enter script HTML..."
                                />
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase">Transactional Analysis</label>
                                    <input
                                        value={logic[selectedNodeId].script?.ta || "Adult"}
                                        onChange={(e) => updateScript(selectedNodeId, logic[selectedNodeId].script?.text || "", e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs focus:border-blue-500 outline-none"
                                        placeholder="e.g., Adult, Rebellious Child"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Variants Mode */}
                        {logic[selectedNodeId].variants && (
                            <div className="space-y-3">
                                {logic[selectedNodeId].variants.map((variant, idx) => (
                                    <div key={idx} className="bg-slate-800/50 p-3 rounded border border-slate-700 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-slate-500 uppercase">Variant {idx + 1}</span>
                                            <button
                                                onClick={() => removeVariant(selectedNodeId, idx)}
                                                className="text-slate-500 hover:text-red-400"
                                            >
                                                <X size={12}/>
                                            </button>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase">Name</label>
                                            <input
                                                value={variant.name || ""}
                                                onChange={(e) => updateVariant(selectedNodeId, idx, 'name', e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs focus:border-blue-500 outline-none"
                                                placeholder="e.g., Lost Lamb, Authority"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase">Script (HTML)</label>
                                            <textarea
                                                value={variant.text || ""}
                                                onChange={(e) => updateVariant(selectedNodeId, idx, 'text', e.target.value)}
                                                className="w-full h-24 bg-slate-900 border border-slate-700 rounded p-2 text-xs font-mono focus:border-blue-500 outline-none resize-none"
                                                placeholder="Enter script HTML..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase">TA</label>
                                            <input
                                                value={variant.ta || "Adult"}
                                                onChange={(e) => updateVariant(selectedNodeId, idx, 'ta', e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs focus:border-blue-500 outline-none"
                                                placeholder="e.g., Adult"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase">Note (optional)</label>
                                            <input
                                                value={variant.note || ""}
                                                onChange={(e) => updateVariant(selectedNodeId, idx, 'note', e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs focus:border-blue-500 outline-none"
                                                placeholder="Usage notes..."
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addVariant(selectedNodeId)}
                                    className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded text-xs font-bold flex items-center justify-center gap-1"
                                >
                                    <Plus size={12}/> Add Another Variant
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                         <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-500 uppercase">Transitions</label>
                            <button onClick={() => addOption(selectedNodeId)} className="text-[10px] bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded flex items-center gap-1"><Plus size={12}/> Add</button>
                        </div>
                        <div className="space-y-3">
                            {logic[selectedNodeId].options?.map((opt, idx) => (
                                <div key={idx} className="bg-slate-800/50 p-3 rounded border border-slate-700 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-[10px] text-slate-500">Button {idx + 1}</span>
                                        <button onClick={() => removeOption(selectedNodeId, idx)} className="text-slate-500 hover:text-red-400"><X size={12}/></button>
                                    </div>
                                    <input
                                        value={opt.label}
                                        onChange={(e) => updateOption(selectedNodeId, idx, 'label', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs focus:border-blue-500 outline-none"
                                    />
                                    <div className="flex gap-2">
                                         <select
                                            value={opt.action}
                                            onChange={(e) => updateOption(selectedNodeId, idx, 'action', e.target.value)}
                                            className="flex-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-[10px] focus:border-blue-500 outline-none"
                                        >
                                            {Object.entries(logic).map(([key, val]) => (
                                                <option key={key} value={key}>{val.label} ({key.substring(0,8)}...)</option>
                                            ))}
                                        </select>
                                         <select
                                            value={opt.style}
                                            onChange={(e) => updateOption(selectedNodeId, idx, 'style', e.target.value)}
                                            className="w-20 bg-slate-900 border border-slate-700 rounded p-1.5 text-[10px] focus:border-blue-500 outline-none"
                                        >
                                            <option value="green">Green</option>
                                            <option value="red">Red</option>
                                            <option value="blue">Blue</option>
                                            <option value="purple">Purple</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
           ) : null}
        </div>
      </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const App = () => {
  // --- CORE STATE ---
  const [logic, setLogic] = useState(() => {
    const saved = localStorage.getItem('titan_logic_v10');
    return saved ? JSON.parse(saved) : LOGIC_CORE_DEFAULT;
  });

  // -- DEFENSE MATRIX STATE (Editable) --
  const [defenseMatrix, setDefenseMatrix] = useState(() => {
    const saved = localStorage.getItem('titan_defense_matrix_v10');
    return saved ? JSON.parse(saved) : DEFENSE_CATEGORIES;
  });

  const [mode, setMode] = useState(MODES.HOME);
  const [currentStage, setCurrentStage] = useState(STAGES.OPENER);
  const [history, setHistory] = useState([]);
  const [scriptVariantIndex, setScriptVariantIndex] = useState(0);
  const [activeDefense, setActiveDefense] = useState(null);
  const [isEditingDefense, setIsEditingDefense] = useState(false);
  const [isMatrixEditing, setIsMatrixEditing] = useState(false);

  // --- CUSTOM SCRIPT STATE ---
  const [scriptOverrides, setScriptOverrides] = useState(() => {
    const saved = localStorage.getItem('titan_script_overrides');
    return saved ? JSON.parse(saved) : {};
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempScriptText, setTempScriptText] = useState("");

  // --- CALL CONTEXT ---
  const [callContext, setCallContext] = useState({
    prospectName: '',
    monthlyCost: '',
  });

  // --- GAMIFICATION ---
  const [xp, setXP] = useState(() => {
    const saved = localStorage.getItem('titan_xp');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [streak, setStreak] = useState(0);
  const [rank, setRank] = useState(RANKS[0]);
  const [animateScore, setAnimateScore] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [sessionStats, setSessionStats] = useState({ calls: 0, meetings: 0, debrief: {} });

  // --- UI STATE ---
  const [showDefenseMatrix, setShowDefenseMatrix] = useState(false);

  // --- EFFECTS ---
  useEffect(() => { localStorage.setItem('titan_xp', xp.toString()); }, [xp]);
  useEffect(() => { localStorage.setItem('titan_logic_v10', JSON.stringify(logic)); }, [logic]);
  useEffect(() => { localStorage.setItem('titan_defense_matrix_v10', JSON.stringify(defenseMatrix)); }, [defenseMatrix]);
  useEffect(() => { localStorage.setItem('titan_script_overrides', JSON.stringify(scriptOverrides)); }, [scriptOverrides]);
  useEffect(() => { setRank([...RANKS].reverse().find(r => xp >= r.minXP) || RANKS[0]); }, [xp]);
  useEffect(() => {
    let interval;
    if (mode !== MODES.HOME && mode !== MODES.FLOW_EDITOR) {
      interval = setInterval(() => setCallDuration(p => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [mode]);

  // --- HELPERS ---
  const formatTime = (s) => `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;
  const getTimerColor = () => callDuration >= TIMER_CRITICAL ? 'text-red-500 animate-pulse' : callDuration >= TIMER_DANGER ? 'text-red-400' : callDuration >= TIMER_WARNING ? 'text-amber-400' : 'text-white';
  const getTimerBg = () => callDuration >= TIMER_CRITICAL ? 'bg-red-900/30' : callDuration >= TIMER_DANGER ? 'bg-red-900/20' : callDuration >= TIMER_WARNING ? 'bg-amber-900/20' : 'bg-slate-800/50';
  const addScore = (amount) => { setXP(p => p + amount); setAnimateScore(true); setTimeout(() => setAnimateScore(false), 500); };
  const updateCallContext = (field, value) => setCallContext(prev => ({ ...prev, [field]: value }));

  // --- HANDLERS ---
  const handleReset = useCallback(() => {
    setMode(MODES.HOME);
    setHistory([]);
    setCurrentStage(STAGES.OPENER);
    setScriptVariantIndex(0);
    setActiveDefense(null);
    setCallDuration(0);
    setCallContext({ prospectName: '', monthlyCost: '' });
    setShowDefenseMatrix(false);
    setStreak(0);
    setIsEditing(false);
    setIsEditingDefense(false);
  }, []);

  const handleResetDefenses = () => {
    if(confirm("Reset all Defense Matrix objections to default? This cannot be undone.")) {
        setDefenseMatrix(DEFENSE_CATEGORIES);
    }
  };

  const updateDefenseItem = (itemId, newValues) => {
    setDefenseMatrix(prev => {
        const next = { ...prev };
        for (const catKey in next) {
            const itemIndex = next[catKey].items.findIndex(i => i.id === itemId);
            if (itemIndex !== -1) {
                const newItems = [...next[catKey].items];
                newItems[itemIndex] = { ...newItems[itemIndex], ...newValues };
                next[catKey] = { ...next[catKey], items: newItems };
                // Also update active defense if it matches
                if (activeDefense && activeDefense.id === itemId) {
                    setActiveDefense(newItems[itemIndex]);
                }
                break;
            }
        }
        return next;
    });
  };

  const handleTransition = useCallback((nextStage, style, bonus = false, debriefReason = null) => {
    if (nextStage === 'RESET') { handleReset(); return; }

    let points = 0;
    if (nextStage === STAGES.VICTORY) {
      points = SCORING.VICTORY;
      setSessionStats(p => ({ ...p, calls: p.calls + 1, meetings: p.meetings + 1 }));
    } else if (nextStage === STAGES.GAMEOVER || nextStage === STAGES.DEBRIEF) {
      points = 10;
      setStreak(0);
      if (debriefReason) {
        setSessionStats(p => ({ ...p, calls: p.calls + 1, debrief: { ...p.debrief, [debriefReason]: (p.debrief[debriefReason] || 0) + 1 } }));
      }
    } else {
      if (style === 'green') points = SCORING.TRANSITION_GREEN;
      if (style === 'blue') points = SCORING.TRANSITION_BLUE;
      if (style === 'purple') points = SCORING.TRANSITION_PURPLE;
      if (style === 'rose') points = SCORING.TRANSITION_ROSE;
      if (style === 'red') points = SCORING.TRANSITION_RED;
      if (bonus) points += SCORING.RECOVERY_BONUS;
      setStreak(p => p + 1);
    }
    addScore(points);
    setHistory(p => [...p, currentStage]);
    setCurrentStage(nextStage);
    setScriptVariantIndex(0);
    setActiveDefense(null);
    setIsEditing(false);
    setIsEditingDefense(false);
  }, [currentStage, callDuration, handleReset]);

  const goBack = useCallback(() => {
    if (history.length === 0) { setMode(MODES.HOME); return; }
    const prev = history[history.length - 1];
    setHistory(p => p.slice(0, -1));
    setCurrentStage(prev);
    setIsEditing(false);
  }, [history]);

  const getRandomDefense = () => {
    const all = Object.values(defenseMatrix).flatMap(c => c.items);
    setActiveDefense(all[Math.floor(Math.random() * all.length)]);
    addScore(SCORING.DEFENSE_WIN);
  };

  // --- SCRIPT EDITING ---
   const getCurrentScriptData = () => {
    const stageData = logic[currentStage];
    if (!stageData) return null;
    return stageData.variants ? stageData.variants[scriptVariantIndex] : stageData.script;
  };

  const getActiveScriptText = () => {
    const key = `${currentStage}_${scriptVariantIndex}`;
    if (scriptOverrides[key]) return scriptOverrides[key];
    const data = getCurrentScriptData();
    return data ? data.text : "";
  };

  const handleEditStart = () => {
    setTempScriptText(getActiveScriptText());
    setIsEditing(true);
  };

  const handleEditSave = () => {
    const key = `${currentStage}_${scriptVariantIndex}`;
    setScriptOverrides(prev => ({
      ...prev,
      [key]: tempScriptText
    }));
    setIsEditing(false);
  };

  const handleResetScript = () => {
    const key = `${currentStage}_${scriptVariantIndex}`;
    const newOverrides = { ...scriptOverrides };
    delete newOverrides[key];
    setScriptOverrides(newOverrides);
    setIsEditing(false);
  };

  // --- KEYBOARD ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (mode === MODES.HOME || mode === MODES.FLOW_EDITOR) return;
      const stageData = logic[currentStage];
      if (e.key === 'Backspace') { e.preventDefault(); goBack(); return; }
      if (e.key === 'Escape') { setActiveDefense(null); setShowDefenseMatrix(false); setIsEditing(false); setIsEditingDefense(false); return; }
      if (e.key === 'd' || e.key === 'D') { setShowDefenseMatrix(p => !p); return; }
      if (e.key === 'r' || e.key === 'R') { getRandomDefense(); return; }
      const numKey = parseInt(e.key);
      if (!isNaN(numKey) && numKey > 0 && numKey <= (stageData?.options?.length || 0)) {
        const opt = stageData.options[numKey - 1];
        handleTransition(opt.action, opt.style, opt.bonus, opt.debriefReason);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, currentStage, goBack, handleTransition, logic]);


  // --- RENDERERS ---
  const renderHome = () => (
    <div className="flex flex-col h-full">
      {sessionStats.calls > 0 && (
        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex gap-6 text-sm">
          <div className="flex gap-2 items-center"><Phone size={16} className="text-slate-400"/><span className="text-slate-300">{sessionStats.calls} calls</span></div>
          <div className="flex gap-2 items-center"><Calendar size={16} className="text-emerald-400"/><span className="text-emerald-300">{sessionStats.meetings} meetings</span></div>
          <div className="flex gap-2 items-center text-slate-500"><span>{Math.round((sessionStats.meetings / sessionStats.calls) * 100) || 0}% conversion</span></div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 content-center">
        <button onClick={() => { setMode(MODES.OUTBOUND); setCurrentStage(STAGES.GK_CHECK); setCallDuration(0); }} className="p-6 bg-gradient-to-br from-blue-900/30 to-blue-950/50 border border-blue-500/30 hover:border-blue-400/50 hover:from-blue-900/40 rounded-2xl flex flex-col items-center gap-4 group transition-all">
          <div className="p-4 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform"><Phone size={32} className="text-blue-400" /></div>
          <div className="text-center">
            <span className="block text-lg font-black text-blue-200 tracking-tight">COLD CALL</span>
            <span className="text-[10px] text-blue-400/60 uppercase tracking-widest">Outbound</span>
          </div>
        </button>
        <button onClick={() => { setMode(MODES.INBOUND); setCurrentStage(STAGES.INBOUND_HOOK); setCallDuration(0); }} className="p-6 bg-gradient-to-br from-emerald-900/30 to-emerald-950/50 border border-emerald-500/30 hover:border-emerald-400/50 hover:from-emerald-900/40 rounded-2xl flex flex-col items-center gap-4 group transition-all">
          <div className="p-4 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform"><Users size={32} className="text-emerald-400" /></div>
          <div className="text-center">
            <span className="block text-lg font-black text-emerald-200 tracking-tight">INBOUND</span>
            <span className="text-[10px] text-emerald-400/60 uppercase tracking-widest">Qualify</span>
          </div>
        </button>
        <button onClick={() => { setMode(MODES.MEETING); setCurrentStage(STAGES.OMEGA_TIME); setCallDuration(0); }} className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-950/50 border border-purple-500/30 hover:border-purple-400/50 hover:from-purple-900/40 rounded-2xl flex flex-col items-center gap-4 group transition-all">
          <div className="p-4 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform"><Target size={32} className="text-purple-400" /></div>
          <div className="text-center">
            <span className="block text-lg font-black text-purple-200 tracking-tight">MEETING</span>
            <span className="text-[10px] text-purple-400/60 uppercase tracking-widest">Closing</span>
          </div>
        </button>

        {/* FLOW EDITOR BUTTON */}
        <button onClick={() => setMode(MODES.FLOW_EDITOR)} className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-slate-500 hover:from-slate-800 hover:to-slate-800 rounded-2xl flex flex-col items-center gap-4 group transition-all">
          <div className="p-4 bg-slate-700/50 rounded-xl group-hover:scale-110 transition-transform group-hover:rotate-90"><Network size={32} className="text-slate-300" /></div>
          <div className="text-center">
            <span className="block text-lg font-black text-slate-200 tracking-tight">FLOW EDITOR</span>
            <span className="text-[10px] text-slate-400/60 uppercase tracking-widest">Customize Logic</span>
          </div>
        </button>
      </div>
      <div className="mt-8 text-center text-slate-600 text-xs flex justify-center gap-4">
        <span><Keyboard size={14} className="inline mr-1" /> Shortcuts Active</span>
      </div>
    </div>
  );

  const renderActiveStage = () => {
    const stageData = logic[currentStage];
    if (!stageData) return <div className="text-red-500 p-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Broken Link</h1>
        <p className="mb-4">The stage "{currentStage}" does not exist in the current logic flow.</p>
        <button onClick={handleReset} className="px-4 py-2 bg-red-600 rounded text-white">Return Home</button>
    </div>;

    const scriptData = stageData.variants ? stageData.variants[scriptVariantIndex] : stageData.script;

    // Dynamic Top Objections based on current state
    const activeTopObjections = [
      defenseMatrix.CREDIBILITY?.items[0],
      defenseMatrix.MONEY?.items[0],
      defenseMatrix.INTENT?.items[0],
      defenseMatrix.PRICE?.items[0],
      defenseMatrix.TIMING?.items[1],
      defenseMatrix.HOSTILITY?.items[1]
    ].filter(Boolean); // Filter out undefined if indices don't match

    return (
      <div className="flex flex-col h-full">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="Back [Backspace]"><ChevronLeft size={20} /></button>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono overflow-hidden">
               {history.slice(-2).map((s, i) => <React.Fragment key={i}><span>{logic[s]?.label}</span><ChevronRight size={10}/></React.Fragment>)}
               <span className="text-slate-300">{stageData.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {EMERGENCY_EXITS.map(exit => (
              <button key={exit.label} onClick={() => handleTransition(exit.action, exit.color)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border ${exit.color === 'emerald' ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50' : exit.color === 'red' ? 'bg-red-900/30 border-red-500/30 text-red-300 hover:bg-red-900/50' : 'bg-amber-900/30 border-amber-500/30 text-amber-300 hover:bg-amber-900/50'}`}>
                <exit.icon size={12} /> {exit.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prospect Name Input */}
        <div className="mb-4 shrink-0">
          <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700 focus-within:border-blue-500 transition-colors">
            <User size={16} className="text-slate-500" />
            <input type="text" value={callContext.prospectName} onChange={(e) => updateCallContext('prospectName', e.target.value)} placeholder="Prospect name..." className="bg-transparent outline-none text-white flex-1 text-sm font-medium placeholder:text-slate-600" />
          </div>
        </div>

        {/* Defense Overlay */}
        {activeDefense && (
          <div className="mb-4 bg-amber-900/20 border border-amber-500/30 rounded-xl p-5 animate-in slide-in-from-top-2 duration-200 shrink-0 shadow-lg relative z-50">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">OBJECTION: {activeDefense.title}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingDefense(!isEditingDefense)}
                  className={`p-1 rounded ${isEditingDefense ? 'bg-amber-500 text-black' : 'hover:bg-amber-900/50 text-amber-500'}`}
                >
                    {isEditingDefense ? <Save size={16}/> : <Edit3 size={16}/>}
                </button>
                <button onClick={() => { setActiveDefense(null); setIsEditingDefense(false); }} className="p-1 hover:bg-amber-900/50 rounded"><X size={16} className="text-amber-500" /></button>
              </div>
            </div>

            {isEditingDefense ? (
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] font-bold text-amber-500 uppercase">Script</label>
                        <textarea
                            value={activeDefense.script}
                            onChange={(e) => updateDefenseItem(activeDefense.id, { script: e.target.value })}
                            className="w-full bg-black/30 border border-amber-500/50 rounded p-2 text-amber-100 text-sm focus:outline-none focus:border-amber-400"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-amber-500 uppercase">Adjustment</label>
                        <input
                            value={activeDefense.adjustment}
                            onChange={(e) => updateDefenseItem(activeDefense.id, { adjustment: e.target.value })}
                            className="w-full bg-black/30 border border-amber-500/50 rounded p-2 text-amber-100 text-xs focus:outline-none focus:border-amber-400"
                        />
                    </div>
                </div>
            ) : (
                <>
                    <p className="text-amber-100 text-lg font-medium leading-relaxed mb-3">"{activeDefense.script}"</p>
                    <div className="flex items-center gap-2 text-xs text-amber-400/80 bg-amber-950/30 p-2 rounded-lg border border-amber-500/10">
                    <Lightbulb size={12} /> <span className="uppercase font-bold">Adjustment:</span> <span className="text-amber-200">{activeDefense.adjustment}</span>
                    </div>
                </>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className={`bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden mb-6 transition-all duration-300 ${activeDefense && !isEditingDefense ? 'opacity-50 blur-sm pointer-events-none' : ''}`}>
            {/* Phase Indicator Bar */}
            <div className={`absolute top-0 left-0 w-1 h-full ${
              stageData.phase === 'ENTRY' ? 'bg-slate-500' :
              stageData.phase === 'OPENER' ? 'bg-yellow-500' :
              stageData.phase === 'RECOVERY' ? 'bg-orange-500' :
              stageData.phase === 'GAUNTLET' ? 'bg-purple-500' :
              stageData.phase === 'PITCH' ? 'bg-blue-500' :
              stageData.phase === 'GRINDER' ? 'bg-rose-500' :
              stageData.phase === 'CLOSE' ? 'bg-emerald-500' :
              stageData.phase === 'INBOUND' ? 'bg-emerald-500' :
              stageData.phase === 'OMEGA' ? 'bg-purple-500' :
              stageData.phase === 'END' ? 'bg-slate-600' : ''
            }`}></div>

            {/* Variant Select */}
            {stageData.variants && (
              <div className="flex flex-wrap gap-2 mb-5 justify-center">
                {stageData.variants.map((v, i) => (
                  <button key={i} onClick={() => { setScriptVariantIndex(i); setIsEditing(false); }} className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${i === scriptVariantIndex ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200'}`}>
                    {v.name}
                  </button>
                ))}
              </div>
            )}

            {/* TA Badge & Edit Button */}
            <div className="flex justify-between items-start mb-3">
               <div className="flex-1"></div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
                  <Brain size={10} /> {scriptData.ta}
                </span>
                <button
                  onClick={isEditing ? handleEditSave : handleEditStart}
                  className={`p-1.5 rounded transition-colors ${isEditing ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                  title={isEditing ? "Save Script" : "Edit Script"}
                >
                  {isEditing ? <Save size={14} /> : <Edit3 size={14} />}
                </button>
                {/* Show reset if script is customized */}
                {scriptOverrides[`${currentStage}_${scriptVariantIndex}`] && !isEditing && (
                    <button
                      onClick={handleResetScript}
                      className="p-1.5 rounded bg-slate-700 text-slate-400 hover:bg-red-900/50 hover:text-red-300 transition-colors"
                      title="Reset to Original"
                    >
                      <RotateCw size={14} />
                    </button>
                )}
              </div>
            </div>

            {/* Script Text or Editor */}
            {isEditing ? (
              <div className="mb-6">
                <textarea
                  value={tempScriptText}
                  onChange={(e) => setTempScriptText(e.target.value)}
                  className="w-full h-48 bg-slate-900/50 border border-blue-500 rounded-lg p-4 text-white font-mono text-sm focus:outline-none resize-none"
                  placeholder="Enter custom script..."
                />
                <div className="flex justify-between mt-2">
                    <p className="text-[10px] text-slate-500">Supports HTML tags: &lt;span class='text-red-400'&gt;...&lt;/span&gt;</p>
                    <button onClick={() => setIsEditing(false)} className="text-xs text-red-400 hover:text-red-300 px-3 py-1">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="text-xl text-white font-medium leading-relaxed text-center mb-6 font-serif tracking-wide select-text"
                dangerouslySetInnerHTML={{ __html: getActiveScriptText().replace(/\[NAME\]/g, `<span class="text-cyan-300">${callContext.prospectName || 'NAME'}</span>`) }}
              />
            )}

            {/* Note */}
            {scriptData.note && <p className="text-center text-sm text-slate-400 italic border-t border-slate-700 pt-4 mt-4">{scriptData.note}</p>}

            {/* Inputs */}
            {stageData.hasCapture && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg px-4 py-3 border border-slate-700 focus-within:border-blue-500 transition-colors">
                  <FileText size={16} className="text-slate-500" />
                  <input type="text" value={callContext[stageData.captureField] || ''} onChange={(e) => updateCallContext(stageData.captureField, e.target.value)} placeholder={`Capture ${stageData.captureField}...`} className="bg-transparent outline-none text-white flex-1 text-sm" />
                </div>
              </div>
            )}
            {stageData.hasInput && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center gap-4 bg-slate-900/50 rounded-lg px-4 py-3 border border-slate-700">
                  <span className="text-slate-400 text-lg">£</span>
                  <input type="number" value={callContext.monthlyCost} onChange={(e) => updateCallContext('monthlyCost', e.target.value)} placeholder="Monthly cost..." className="bg-transparent outline-none text-white flex-1 text-lg" />
                  <div className="text-right border-l border-slate-700 pl-4">
                    <div className="text-[10px] text-slate-500 uppercase">Annual Pain</div>
                    <div className="text-xl font-bold text-rose-400">£{callContext.monthlyCost ? (parseFloat(callContext.monthlyCost) * 12).toLocaleString() : '0'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Objections (Now mapped from State) */}
          {!showDefenseMatrix && !activeDefense && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2"><Zap size={12} /> Quick Objections</span>
                <button onClick={() => setShowDefenseMatrix(true)} className="text-[10px] text-slate-500 hover:text-slate-300 uppercase flex items-center gap-1">Full Matrix [D] <ChevronRight size={12} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeTopObjections.map((obj) => (
                  <button key={obj.id} onClick={() => setActiveDefense(obj)} className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors shadow-sm">{obj.title}</button>
                ))}
                <button onClick={getRandomDefense} className="px-3 py-1.5 text-xs bg-red-900/20 hover:bg-red-900/40 text-red-300 rounded-lg border border-red-500/20 transition-colors flex items-center gap-1.5"><Dices size={12} /> Random [R]</button>
              </div>
            </div>
          )}

          {/* Full Matrix (Now Editable) */}
          {showDefenseMatrix && (
            <div className="mb-6 animate-in slide-in-from-bottom-4 duration-200 bg-slate-900 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700">
                <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2"><Shield size={12} /> Full Defense Matrix</span>
                <div className="flex gap-2">
                     {/* Reset Button */}
                    <button onClick={handleResetDefenses} title="Restore Defaults" className="p-1 text-slate-500 hover:text-red-400"><RefreshCw size={12} /></button>
                     {/* Edit Toggle */}
                    <button onClick={() => setIsMatrixEditing(!isMatrixEditing)} className={`text-[10px] uppercase flex items-center gap-1 px-2 py-0.5 rounded ${isMatrixEditing ? 'bg-blue-600 text-white' : 'text-blue-400 bg-blue-900/20'}`}>
                        {isMatrixEditing ? 'Done' : 'Edit Mode'} <Edit3 size={10} />
                    </button>
                    <button onClick={() => setShowDefenseMatrix(false)} className="text-[10px] text-slate-500 hover:text-slate-300 uppercase flex items-center gap-1">Close [Esc] <X size={12} /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.values(defenseMatrix).map((cat) => (
                  <div key={cat.id} className={`p-3 rounded-xl border bg-${cat.color}-950/10 border-${cat.color}-900/20`}>
                    <h5 className={`text-${cat.color}-400 text-[10px] font-bold uppercase mb-2 flex items-center gap-1.5`}><div className={`w-2 h-2 rounded-full bg-${cat.color}-500`}></div>{cat.label}</h5>
                    <div className="flex flex-col gap-1.5">
                      {cat.items.map((item) => (
                        isMatrixEditing ? (
                             <div key={item.id} className="flex gap-1">
                                <input
                                    value={item.title}
                                    onChange={(e) => updateDefenseItem(item.id, { title: e.target.value })}
                                    className="flex-1 text-[10px] px-2 py-1 rounded bg-slate-800 border border-slate-600 text-white focus:border-blue-500 outline-none"
                                />
                                {/* Hidden textarea for script editing in list view, or we just let them click to edit in overlay */}
                             </div>
                        ) : (
                            <button key={item.id} onClick={() => { setActiveDefense(item); setShowDefenseMatrix(false); }} className="text-left text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors">{item.title}</button>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {isMatrixEditing && <div className="mt-2 text-[10px] text-slate-500 text-center italic">Tip: Click a button in normal mode to edit the full Script & Adjustment.</div>}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-800 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {stageData.options.map((opt, i) => (
              <button key={i} onClick={() => handleTransition(opt.action, opt.style, opt.bonus, opt.debriefReason)} className={`p-4 rounded-xl border flex items-center justify-between group transition-all relative overflow-hidden ${
                opt.style === 'green' ? 'bg-emerald-900/20 border-emerald-500/30 hover:bg-emerald-900/40 text-emerald-100' :
                opt.style === 'red' ? 'bg-red-900/20 border-red-500/30 hover:bg-red-900/40 text-red-100' :
                opt.style === 'blue' ? 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/40 text-blue-100' :
                opt.style === 'rose' ? 'bg-rose-900/20 border-rose-500/30 hover:bg-rose-900/40 text-rose-100' :
                opt.style === 'purple' ? 'bg-purple-900/20 border-purple-500/30 hover:bg-purple-900/40 text-purple-100' :
                opt.style === 'gray' ? 'bg-slate-800 border-slate-600 hover:bg-slate-700 text-slate-300' :
                'bg-amber-900/20 border-amber-500/30 hover:bg-amber-900/40 text-amber-100'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-white/10 text-[10px] font-bold text-white/70 shadow-sm">{opt.key || i + 1}</span>
                  <span className="font-bold text-sm">{opt.label}</span>
                </div>
                {opt.bonus && <span className="absolute top-1 right-1 text-[8px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold">+XP</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-6 overflow-hidden">
      <div className="max-w-7xl mx-auto h-[calc(100vh-3rem)] bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 shrink-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-900/20"><Brain className="text-white" size={22} /></div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">TITAN PROTOCOL <span className="text-blue-400">V10</span></h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">OPTIMIZED EDITION</p>
            </div>
          </div>
          <div className={`flex items-center gap-4 px-4 py-2 rounded-xl border border-slate-700 transition-colors ${getTimerBg()}`}>
            {mode !== MODES.HOME && mode !== MODES.FLOW_EDITOR && (
              <div className="flex items-center gap-2 pr-4 border-r border-slate-700">
                <Clock size={16} className="text-slate-400" />
                <span className={`text-lg font-bold font-mono tabular-nums ${getTimerColor()}`}>{formatTime(callDuration)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <rank.icon className={rank.color} size={16} />
              <div className="flex flex-col">
                <span className={`text-[10px] font-bold ${rank.color} uppercase tracking-wider`}>{rank.name}</span>
                <div className="w-20 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${Math.min(100, (xp / 5000) * 100)}%` }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-700">
              <Trophy className="text-yellow-400" size={16} />
              <span className={`text-lg font-bold font-mono tabular-nums transition-all ${animateScore ? 'text-yellow-300 scale-110' : 'text-white'}`}>{xp.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-700">
              <Flame className={streak > 2 ? 'text-orange-500 animate-pulse' : 'text-slate-600'} size={16} />
              <span className="text-lg font-bold font-mono text-white">{streak}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode !== MODES.HOME && (
              <button onClick={handleReset} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-slate-400 text-xs font-bold uppercase transition-colors">
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-0 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
          {mode === MODES.HOME ? (
              <div className="p-6 h-full">{renderHome()}</div>
            ) : mode === MODES.FLOW_EDITOR ? (
              <FlowEditor logic={logic} setLogic={setLogic} />
            ) : (
              <div className="p-6 h-full">{renderActiveStage()}</div>
          )}
        </div>

        {/* Footer */}
        {mode !== MODES.HOME && mode !== MODES.FLOW_EDITOR && (
          <div className="px-6 py-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-600 font-mono shrink-0 bg-slate-900">
            <div className="flex items-center gap-4">
              <span><span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">1-4</span> Select</span>
              <span><span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">⌫</span> Back</span>
              <span><span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">D</span> Matrix</span>
              <span><span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">R</span> Random</span>
              <span><span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">Esc</span> Close</span>
            </div>
            <div className="text-slate-500">Phase: <span className="text-slate-300 font-bold">{logic[currentStage]?.phase || 'HOME'}</span></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
