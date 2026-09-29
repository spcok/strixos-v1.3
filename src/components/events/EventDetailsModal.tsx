import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  Users, 
  Feather, 
  Heart, 
  GraduationCap, 
  Cake, 
  Compass, 
  Pencil, 
  Trash2, 
  CreditCard, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Loader2,
  Copy,
  Bird
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import type { FullEventEntry } from './EventFormModal';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: FullEventEntry | null;
  onEdit?: (event: FullEventEntry) => void;
}

const formatDisplayDate = (isoOrDate?: string | null): string => {
  if (!isoOrDate) return 'Date Unrecorded';
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return String(isoOrDate);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatDisplayTime = (isoOrTime?: string | null): string => {
  if (!isoOrTime) return '--:--';
  if (isoOrTime.length === 5 && isoOrTime.includes(':')) return isoOrTime;
  const d = new Date(isoOrTime);
  if (isNaN(d.getTime())) return String(isoOrTime);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export function EventDetailsModal({ isOpen, onClose, event, onEdit }: EventDetailsModalProps) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events_calendar')
        .update({ is_deleted: true })
        .eq('id', eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Event removed from operational schedule.');
      queryClient.invalidateQueries({ queryKey: ['events_ledger_management'] });
      queryClient.invalidateQueries({ queryKey: ['operational_calendar'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete event.');
    },
    onSettled: () => {
      setIsDeleting(false);
    }
  });

  if (!isOpen || !event) return null;

  const comm = event.commercials;
  const staff = event.staff_allocations || [];
  const animals = event.animal_allocations || [];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 font-sans text-left">
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* TOP ACCENT HEADER */}
        <div className={`p-5 sm:p-6 text-white shrink-0 relative flex flex-col justify-between ${
          event.event_type === 'WEDDING' 
            ? 'bg-gradient-to-r from-purple-950 via-purple-900 to-slate-900' 
            : event.event_type === 'SCHOOL_TALK'
            ? 'bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900'
            : event.event_type === 'PARTY'
            ? 'bg-gradient-to-r from-pink-950 via-rose-900 to-slate-900'
            : event.event_type === 'EXPERIENCE'
            ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900'
            : 'bg-slate-900'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-white/20 text-white backdrop-blur-sm border border-white/10 flex items-center gap-1">
                  {event.event_type === 'WEDDING' && <Heart size={11} className="text-pink-300" />}
                  {event.event_type === 'SCHOOL_TALK' && <GraduationCap size={11} className="text-blue-300" />}
                  {event.event_type === 'PARTY' && <Cake size={11} className="text-pink-300" />}
                  {event.event_type === 'EXPERIENCE' && <Compass size={11} className="text-emerald-300" />}
                  <span>{event.event_type.replace('_', ' ')}</span>
                </span>

                {event.event_type === 'WEDDING' && (
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                    event.wedding_ring_delivery_only 
                      ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30' 
                      : 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                  }`}>
                    {event.wedding_ring_delivery_only ? 'Ring Delivery Only' : 'Ring Delivery & Reception Display'}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug text-white">
                {event.title}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(event)}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
                  title="Edit Booking"
                >
                  <Pencil size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Core Date & Time Banner */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-white/90 font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-white/70" />
              <span className="font-bold">{formatDisplayDate(event.start_time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-white/70" />
              <span className="font-bold">
                {formatDisplayTime(event.start_time)} – {formatDisplayTime(event.end_time)}
              </span>
            </div>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1 bg-white text-slate-800">

          {/* ========================================================= */}
          {/* WEDDING-SPECIFIC SECTION                                  */}
          {/* ========================================================= */}
          {event.event_type === 'WEDDING' && (
            <div className="space-y-4">
              
              {/* Flight Participant & Scope */}
              <div className="p-4 bg-purple-50/80 border border-purple-200/80 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-700 block">
                    Designated Ring Catcher / Participant
                  </span>
                  <p className="text-sm font-black text-purple-950 mt-0.5">
                    {event.wedding_flying_participant || 'Not Specified (Check with Coordinator)'}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-700 block">
                    Service Scope
                  </span>
                  <span className="text-xs font-bold text-purple-900">
                    {event.wedding_ring_delivery_only ? 'Ring Delivery Only' : 'Aisle Flight + Static Guest Greeting'}
                  </span>
                </div>
              </div>

              {/* Dual Rehearsals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Rehearsal 1: At Centre */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Bird size={14} className="text-purple-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      KOA Centre Flight Rehearsal
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 pt-1">
                    {event.rehearsal_at_centre_date 
                      ? `${formatDisplayDate(event.rehearsal_at_centre_date)} at ${formatDisplayTime(event.rehearsal_at_centre_time)}`
                      : 'No pre-wedding flight session booked'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Participant practices flying the bird with KOA keepers.
                  </p>
                </div>

                {/* Rehearsal 2: Day-of Onsite */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock size={14} className="text-amber-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Day-of Onsite Rehearsal
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 pt-1">
                    {event.rehearsal_time ? formatDisplayTime(event.rehearsal_time) : 'No onsite walk-through scheduled'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Pre-ceremony venue walkthrough before guests assemble.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* SCHOOL TALK SPECIFIC SECTION                              */}
          {/* ========================================================= */}
          {event.event_type === 'SCHOOL_TALK' && event.school_talk_curriculum && (
            <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-700 block">
                Curriculum Topic &amp; Educational Presentation
              </span>
              <p className="text-sm font-black text-blue-950 mt-0.5">
                {event.school_talk_curriculum}
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* PARTY SPECIFIC SECTION                                    */}
          {/* ========================================================= */}
          {event.event_type === 'PARTY' && event.party_type && (
            <div className="p-4 bg-pink-50/80 border border-pink-200/80 rounded-2xl">
              <span className="text-[9px] font-black uppercase tracking-widest text-pink-700 block">
                Party Type &amp; Celebration Theme
              </span>
              <p className="text-sm font-black text-pink-950 mt-0.5">
                {event.party_type}
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* ALLOCATED SPECIMEN ANIMALS                                */}
          {/* ========================================================= */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-1.5">
                <Feather size={13} className="text-emerald-600" /> 
                Allocated Animal Ambassadors ({animals.length})
              </span>
            </div>

            {animals.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No animals currently assigned to this event.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {animals.map((alloc) => {
                  const anim = alloc.animals;
                  return (
                    <div 
                      key={alloc.animal_id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img 
                          src={anim?.profile_image_url || '/offline-media-fallback.svg'} 
                          alt={anim?.name || 'Animal'}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = '/offline-media-fallback.svg'; }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-black text-slate-900 truncate">{anim?.name || 'Specimen'}</p>
                          <span className="text-[9px] font-mono text-slate-400 font-bold">{anim?.ring_number || 'No Ring'}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{anim?.species}</p>
                        <p className="text-[9px] font-bold text-emerald-700 mt-0.5 truncate bg-emerald-50 px-1.5 py-0.2 rounded self-start inline-block">
                          {alloc.role_description || 'Flight / Display'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* ALLOCATED STAFF                                           */}
          {/* ========================================================= */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-1.5">
              <Users size={13} className="text-slate-500" /> 
              Allocated Keepers &amp; Team ({staff.length})
            </span>

            {staff.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No staff members allocated yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {staff.map((s) => (
                  <div 
                    key={s.user_id}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2 shadow-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-900 text-white text-[9px] font-black flex items-center justify-center">
                      {s.users?.initials || s.users?.name?.charAt(0) || 'K'}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{s.users?.name || 'Staff Member'}</span>
                    {s.users?.role && (
                      <span className="text-[9px] font-bold text-slate-400 uppercase">({s.users.role})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* VENUE & SITE CONTACT                                      */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Venue Address */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  <MapPin size={12} /> Venue Location
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(event.venue_address, 'Address')}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  title="Copy Address"
                >
                  <Copy size={12} />
                </button>
              </div>
              <p className="text-xs font-bold text-slate-900 leading-relaxed">
                {event.venue_address}
              </p>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue_address)}`}
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 hover:underline pt-1"
              >
                <span>Open in Google Maps</span>
                <ExternalLink size={10} />
              </a>
            </div>

            {/* Onsite Contact */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <User size={12} /> Onsite Point of Contact
              </span>
              <p className="text-xs font-bold text-slate-900">
                {event.site_contact_name}
              </p>
              {event.site_contact_phone ? (
                <a 
                  href={`tel:${event.site_contact_phone}`}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 hover:underline pt-1"
                >
                  <Phone size={12} />
                  <span>{event.site_contact_phone}</span>
                </a>
              ) : (
                <p className="text-xs text-slate-400 italic">No phone number recorded</p>
              )}
            </div>
          </div>

          {/* Description & Internal Operational Notes */}
          {event.description && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <FileText size={12} /> Operational Cues &amp; Instructions
              </span>
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* COMMERCIALS & INVOICING SUMMARY                           */}
          {/* ========================================================= */}
          {comm && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <CreditCard size={12} /> Commercial Ledger
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                  comm.payment_status === 'PAID_IN_FULL'
                    ? 'bg-emerald-500 text-white'
                    : comm.payment_status === 'DEPOSIT_PAID'
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-rose-500 text-white'
                }`}>
                  {comm.payment_status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block">Total Fee</span>
                  <span className="text-sm font-black text-white">£{Number(comm.total_amount).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block">Deposit</span>
                  <span className="text-sm font-black text-white">£{Number(comm.deposit_amount).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block">Balance Due</span>
                  <span className="text-xs font-bold text-slate-200">
                    {comm.balance_due_date ? formatDisplayDate(comm.balance_due_date) : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block">Xero Invoice</span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {comm.xero_invoice_number || 'Unlinked'}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Remove this event from the operational schedule?')) {
                setIsDeleting(true);
                deleteMutation.mutate(event.id);
              }
            }}
            disabled={isDeleting}
            className="text-xs font-black uppercase tracking-wider text-rose-600 hover:text-rose-800 flex items-center gap-1.5 p-2 rounded-xl hover:bg-rose-50 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={14} />}
            <span>Delete Event</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(event)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Pencil size={13} />
                <span>Edit Booking</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default EventDetailsModal;