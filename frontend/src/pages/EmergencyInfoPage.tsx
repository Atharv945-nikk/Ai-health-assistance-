import React from 'react';
import {
  PhoneCall,
  AlertTriangle,
  HeartCrack,
  Activity,
  Zap,
  ShieldAlert,
  Clock,
  ExternalLink,
  ChevronRight,
  LifeBuoy
} from 'lucide-react';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

export const EmergencyInfoPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-red-100">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            Critical Emergency Notice
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Immediate Emergency Assistance
          </h1>
          <p className="text-red-100 max-w-2xl text-base sm:text-lg leading-relaxed">
            If you or someone nearby is experiencing a life-threatening medical crisis, severe trauma,
            loss of consciousness, or acute chest pain, <strong>stop using this app immediately and contact emergency services.</strong>
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <a
              href="tel:911"
              className="inline-flex items-center gap-2.5 bg-white text-red-700 font-bold px-6 py-3.5 rounded-xl shadow-lg hover:bg-red-50 transition-all text-base group"
            >
              <PhoneCall className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
              Call 911 (US / Canada)
            </a>
            <a
              href="tel:112"
              className="inline-flex items-center gap-2.5 bg-red-800 text-white font-bold px-6 py-3.5 rounded-xl border border-red-500/50 hover:bg-red-900 transition-all text-base"
            >
              <PhoneCall className="w-5 h-5 text-red-300" />
              Call 112 (EU / India / Global)
            </a>
            <a
              href="tel:988"
              className="inline-flex items-center gap-2.5 bg-rose-950 text-white font-bold px-6 py-3.5 rounded-xl border border-rose-700 hover:bg-rose-900 transition-all text-base"
            >
              <LifeBuoy className="w-5 h-5 text-rose-300" />
              Dial 988 (Suicide & Crisis)
            </a>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* FAST Stroke Warning Section */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">FAST Stroke Recognition Protocol</h2>
            <p className="text-sm text-slate-500">Every second counts during a cerebrovascular accident (stroke).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-red-100 bg-red-50/50 space-y-2">
            <span className="text-2xl font-black text-red-600">F</span>
            <h3 className="font-bold text-slate-900">Face Drooping</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Does one side of the face droop or is it numb? Ask the person to smile. Is the smile uneven?
            </p>
          </div>

          <div className="p-4 rounded-xl border border-red-100 bg-red-50/50 space-y-2">
            <span className="text-2xl font-black text-red-600">A</span>
            <h3 className="font-bold text-slate-900">Arm Weakness</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Is one arm weak or numb? Ask the person to raise both arms. Does one arm drift downward?
            </p>
          </div>

          <div className="p-4 rounded-xl border border-red-100 bg-red-50/50 space-y-2">
            <span className="text-2xl font-black text-red-600">S</span>
            <h3 className="font-bold text-slate-900">Speech Difficulty</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Is speech slurred? Is the person unable to speak or hard to understand? Ask them to repeat a simple sentence.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-red-600 bg-red-600 text-white space-y-2 shadow-md">
            <span className="text-2xl font-black text-white">T</span>
            <h3 className="font-bold text-white">Time to Call</h3>
            <p className="text-xs text-red-100 leading-relaxed">
              If the person shows ANY of these symptoms, even if they disappear, call 911 or 112 immediately!
            </p>
          </div>
        </div>
      </section>

      {/* Red-Flag Urgent Conditions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <HeartCrack className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Cardiac Emergencies</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>Heavy pressure, fullness, squeezing, or pain in the center of the chest lasting more than a few minutes.</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>Pain spreading to shoulders, neck, jaw, arms, or back accompanied by cold sweat or syncope.</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>Sudden severe shortness of breath, lightheadedness, or sudden rapid irregular heartbeat.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Anaphylaxis & Severe Allergies</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>Swelling of the lips, tongue, throat, or airway causing wheezing, stridor, or inability to swallow.</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>Sudden widespread hives, flushing, dizziness, fainting, or acute drop in blood pressure.</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span><strong>Action:</strong> Administer auto-injectable epinephrine (EpiPen) immediately into the outer thigh and dial 911.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Directory of Emergency Contacts */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">National & International Emergency Directory</h2>
            <p className="text-sm text-slate-500">Keep these official hotlines accessible for your jurisdiction.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Region / Service</th>
                <th className="py-3 px-4">Emergency Contact</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Direct Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">United States & Canada</td>
                <td className="py-3.5 px-4 font-mono font-bold text-red-600">911</td>
                <td className="py-3.5 px-4 text-slate-500">Police / Fire / Paramedic EMS</td>
                <td className="py-3.5 px-4">
                  <a href="tel:911" className="text-teal-600 font-semibold hover:underline">Call 911</a>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">European Union & Global Standard</td>
                <td className="py-3.5 px-4 font-mono font-bold text-red-600">112</td>
                <td className="py-3.5 px-4 text-slate-500">Universal Emergency Response</td>
                <td className="py-3.5 px-4">
                  <a href="tel:112" className="text-teal-600 font-semibold hover:underline">Call 112</a>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">United Kingdom</td>
                <td className="py-3.5 px-4 font-mono font-bold text-red-600">999 (or 111 non-emergency)</td>
                <td className="py-3.5 px-4 text-slate-500">Ambulance & NHS Direct</td>
                <td className="py-3.5 px-4">
                  <a href="tel:999" className="text-teal-600 font-semibold hover:underline">Call 999</a>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">India</td>
                <td className="py-3.5 px-4 font-mono font-bold text-red-600">112 (or 102 / 108 Ambulance)</td>
                <td className="py-3.5 px-4 text-slate-500">National Emergency Response System</td>
                <td className="py-3.5 px-4">
                  <a href="tel:112" className="text-teal-600 font-semibold hover:underline">Call 112</a>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">Suicide & Mental Health Crisis Lifeline</td>
                <td className="py-3.5 px-4 font-mono font-bold text-rose-600">988</td>
                <td className="py-3.5 px-4 text-slate-500">Free, confidential 24/7 crisis support</td>
                <td className="py-3.5 px-4">
                  <a href="tel:988" className="text-teal-600 font-semibold hover:underline">Dial 988</a>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">Poison Control Center (US)</td>
                <td className="py-3.5 px-4 font-mono font-bold text-amber-600">1-800-222-1222</td>
                <td className="py-3.5 px-4 text-slate-500">Toxicological Emergency Guidance</td>
                <td className="py-3.5 px-4">
                  <a href="tel:18002221222" className="text-teal-600 font-semibold hover:underline">Call 1-800-222-1222</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Mandatory Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};
