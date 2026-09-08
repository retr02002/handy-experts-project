"use client";

import React, { useMemo, useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { SlotCalendarModal } from "./SlotCalendarModal";
import type { CustomerDetails, SlotDetails } from "../checkoutTypes";

interface Props {
  details: CustomerDetails;
  slot: SlotDetails;
  onChange: (slot: SlotDetails) => void;
  onChangeAddress: () => void;
}

const ALL_TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const EARLIEST_COUNT = 3;

function formatSlotLabel(hour: string): string {
  const [h] = hour.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:00 ${period}`;
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildDayChips() {
  const days: { iso: string; dow: string; dom: number; label: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      iso: toIso(d),
      dow: d.toLocaleDateString("en-US", { weekday: "short" }),
      dom: d.getDate(),
      label: i === 0 ? "Today" : i === 1 ? "Tmrw" : d.toLocaleDateString("en-US", { weekday: "short" }),
    });
  }
  return days;
}

function formatCustomDate(iso: string): { dow: string; dom: number } {
  const d = new Date(`${iso}T00:00:00`);
  return { dow: d.toLocaleDateString("en-US", { month: "short" }), dom: d.getDate() };
}

export function SlotStep({ details, slot, onChange, onChangeAddress }: Props) {
  const days = useMemo(buildDayChips, []);
  const todayIso = days[0].iso;
  const [selectedDay, setSelectedDay] = useState(todayIso);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const selectInstant = () => onChange({ isInstant: true, scheduledFor: null });

  // A slot on today must still be in the future — no backward booking.
  const availableTimeSlots = useMemo(() => {
    if (selectedDay !== todayIso) return ALL_TIME_SLOTS;
    const now = new Date();
    return ALL_TIME_SLOTS.filter((time) => {
      const [h, m] = time.split(":").map(Number);
      const slotDate = new Date();
      slotDate.setHours(h, m, 0, 0);
      return slotDate.getTime() > now.getTime();
    });
  }, [selectedDay, todayIso]);

  const selectSlot = (dayIso: string, time: string) => {
    setSelectedDay(dayIso);
    setSelectedTime(time);
    const scheduledFor = new Date(`${dayIso}T${time}:00`).toISOString();
    onChange({ isInstant: false, scheduledFor });
  };

  const pickDay = (dayIso: string) => {
    const now = new Date();
    const timesForDay =
      dayIso === todayIso
        ? ALL_TIME_SLOTS.filter((time) => {
            const [h, m] = time.split(":").map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);
            return d.getTime() > now.getTime();
          })
        : ALL_TIME_SLOTS;
    const nextTime = timesForDay.includes(selectedTime ?? "") ? selectedTime! : timesForDay[0] ?? null;
    setSelectedDay(dayIso);
    setSelectedTime(nextTime);
    // Always flip into Schedule mode, even with no time picked yet (e.g. every
    // slot for "today" has already passed) — otherwise the Schedule card can
    // silently fail to activate, and isSlotComplete already blocks continuing
    // until a real scheduledFor is set.
    onChange({ isInstant: false, scheduledFor: nextTime ? new Date(`${dayIso}T${nextTime}:00`).toISOString() : null });
  };

  const earliestSlots = availableTimeSlots.slice(0, EARLIEST_COUNT);
  const moreSlots = availableTimeSlots.slice(EARLIEST_COUNT);

  const isCustomDay = !days.some((d) => d.iso === selectedDay);
  const customChip = isCustomDay ? formatCustomDate(selectedDay) : null;

  return (
    <div className="bg-white dark:bg-[#0B1221] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 sm:p-6 flex flex-col gap-5 overflow-hidden">
      <div className="min-w-0">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">When do you want your service?</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Choose instant service or pick a time that works for you.
        </p>
      </div>

      {/* Address recap */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 min-w-0">
        <ClientIcon icon="ph:map-pin-fill" className="w-4 h-4 text-[#00B4FF] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">{details.address}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            {details.city}, {details.pincode}
          </p>
        </div>
        <button
          type="button"
          onClick={onChangeAddress}
          className="text-[11px] sm:text-xs font-bold text-[#00B4FF] hover:text-blue-600 cursor-pointer shrink-0 whitespace-nowrap"
        >
          Change
        </button>
      </div>

      {/* Instant vs Schedule — richer cards, not tabs */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={selectInstant}
          className={`relative flex flex-col gap-2 rounded-2xl border-2 p-3.5 sm:p-4 text-left transition-all cursor-pointer min-w-0 ${
            slot.isInstant
              ? "border-[#00B4FF] bg-[#00B4FF]/5 shadow-sm"
              : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
          }`}
        >
          <span
            className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
              slot.isInstant ? "border-[#00B4FF]" : "border-slate-300 dark:border-slate-600"
            }`}
          >
            {slot.isInstant && <span className="w-2 h-2 rounded-full bg-[#00B4FF]" />}
          </span>
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${slot.isInstant ? "bg-[#00B4FF]/15" : "bg-slate-100 dark:bg-slate-800"}`}>
            <ClientIcon icon="ph:lightning-fill" className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${slot.isInstant ? "text-[#00B4FF]" : "text-slate-400"}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Instant</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-snug">As soon as possible</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            if (slot.isInstant) pickDay(selectedDay);
          }}
          className={`relative flex flex-col gap-2 rounded-2xl border-2 p-3.5 sm:p-4 text-left transition-all cursor-pointer min-w-0 ${
            !slot.isInstant
              ? "border-[#00B4FF] bg-[#00B4FF]/5 shadow-sm"
              : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
          }`}
        >
          <span
            className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
              !slot.isInstant ? "border-[#00B4FF]" : "border-slate-300 dark:border-slate-600"
            }`}
          >
            {!slot.isInstant && <span className="w-2 h-2 rounded-full bg-[#00B4FF]" />}
          </span>
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${!slot.isInstant ? "bg-[#00B4FF]/15" : "bg-slate-100 dark:bg-slate-800"}`}>
            <ClientIcon icon="ph:calendar-blank-fill" className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${!slot.isInstant ? "text-[#00B4FF]" : "text-slate-400"}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Schedule</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-snug">Pick a day &amp; time</p>
          </div>
        </button>
      </div>

      {!slot.isInstant && (
        <div className="flex flex-col gap-4 min-w-0">
          {/* Day chips */}
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Select Date</h3>
              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                className="text-[11px] sm:text-xs font-bold text-[#00B4FF] hover:text-blue-600 flex items-center gap-1 shrink-0"
              >
                <ClientIcon icon="ph:calendar-plus-bold" className="w-3.5 h-3.5" />
                More dates
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {customChip && (
                <button
                  type="button"
                  className="flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-xl border-2 border-[#00B4FF] bg-[#00B4FF]/5 text-[#00B4FF] transition-all"
                >
                  <span className="text-[10px] font-semibold uppercase whitespace-nowrap">{customChip.dow}</span>
                  <span className="text-base font-bold">{customChip.dom}</span>
                </button>
              )}
              {days.map((d) => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => pickDay(d.iso)}
                  className={`flex flex-col items-center justify-center shrink-0 w-14 h-16 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedDay === d.iso
                      ? "border-[#00B4FF] bg-[#00B4FF]/5 text-[#00B4FF]"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300"
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase whitespace-nowrap">
                    {d.label === "Today" || d.label === "Tmrw" ? d.label : d.dow}
                  </span>
                  <span className="text-base font-bold">{d.dom}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                className="flex flex-col items-center justify-center shrink-0 w-14 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:border-[#00B4FF] hover:text-[#00B4FF] transition-all"
              >
                <ClientIcon icon="ph:calendar-plus" className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Time slots */}
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Select Service Start Time</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 mb-3">
              The professional will arrive within 15 mins of the selected slot.
            </p>

            {availableTimeSlots.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No more slots left for today — pick another date above.
                </p>
              </div>
            ) : (
              <>
                {earliestSlots.length > 0 && (
                  <>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Earliest Available</p>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {earliestSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => selectSlot(selectedDay, time)}
                          className={`h-10 rounded-lg border-2 text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedTime === time
                              ? "border-[#00B4FF] bg-[#00B4FF]/5 text-[#00B4FF]"
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300"
                          }`}
                        >
                          {formatSlotLabel(time)}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {moreSlots.length > 0 && (
                  <>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">More Times</p>
                    <div className="grid grid-cols-3 gap-2">
                      {moreSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => selectSlot(selectedDay, time)}
                          className={`h-10 rounded-lg border-2 text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedTime === time
                              ? "border-[#00B4FF] bg-[#00B4FF]/5 text-[#00B4FF]"
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300"
                          }`}
                        >
                          {formatSlotLabel(time)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {calendarOpen && (
        <SlotCalendarModal
          selectedIso={selectedDay}
          onSelect={(iso) => {
            pickDay(iso);
            setCalendarOpen(false);
          }}
          onClose={() => setCalendarOpen(false)}
        />
      )}
    </div>
  );
}
