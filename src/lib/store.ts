import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrgType = 'institution' | 'agency';
export type Role = 'ops' | 'inst_admin' | 'outlet_staff' | 'agency_admin' | 'outlet_owner';

export interface Org { id: string; name: string; type: OrgType; schema: string; role: string; status: string; }
export interface Outlet { id: string; orgId: string; name: string; }
export interface User { id: string; name: string; orgId: string; outletId: string | null; role: Role; email: string; }
export interface LedgerEntry {
  id: string; walletKey: string; orgId: string; outletId: string | null; type: 'credit'|'debit'|'refund';
  amount: number; balanceAfter: number; reference: string; createdAt: string;
}
export interface VerificationCall {
  id: string; orgId: string; outletId: string | null; by: string; type: 'NIN'|'BVN'|'Phone→NIN';
  subjectRef: string; status: 'verified'|'not_found'; ledgerId: string; amount: number; createdAt: string;
}
export interface RevenueEntry { id: string; orgId: string; kind: string; amount: number; reference: string; createdAt: string; }
export interface AuditEvent { id: string; actor: string; action: string; entity: string; orgId: string; createdAt: string; }

export const BASE_RATES = { NIN: 150, BVN: 100, 'Phone→NIN': 200 } as const;
export const AGENCY_MARKUP = 1.3;

const initialOrgs: Org[] = [
  { id: 'lagoon', name: 'Lagoon Hotels', type: 'institution', schema: 'org_lagoon', role: 'rl_lagoon', status: 'active' },
  { id: 'paygate', name: 'PayGate Agency', type: 'agency', schema: 'org_paygate', role: 'rl_paygate', status: 'active' },
  { id: 'kora', name: 'Kora Microfinance', type: 'institution', schema: 'org_kora', role: 'rl_kora', status: 'active' }
];

const initialOutlets: Outlet[] = [
  { id: 'o1', orgId: 'lagoon', name: 'Lekki Branch' },
  { id: 'o2', orgId: 'lagoon', name: 'Abuja Branch' },
  { id: 'o3', orgId: 'paygate', name: 'Mama Cass Café' },
  { id: 'o4', orgId: 'paygate', name: 'Ikeja Telecom Hub' }
];

const initialUsers: User[] = [
  { id: 'u1', name: 'Amaka Eze', orgId: '', outletId: null, role: 'ops', email: 'amaka@slogani.com' },
  { id: 'u2', name: 'Tunde Bakare', orgId: 'lagoon', outletId: null, role: 'inst_admin', email: 'tunde@lagoon.com' },
  { id: 'u3', name: 'Seyi Ade', orgId: 'lagoon', outletId: 'o1', role: 'outlet_staff', email: 'seyi@lagoon.com' },
  { id: 'u4', name: 'Ngozi Obi', orgId: 'paygate', outletId: null, role: 'agency_admin', email: 'ngozi@paygate.com' },
  { id: 'u5', name: 'Cass Okafor', orgId: 'paygate', outletId: 'o3', role: 'outlet_owner', email: 'cass@mamacass.com' }
];

interface TruvoState {
  currentUser: User | null;
  orgs: Org[];
  outlets: Outlet[];
  users: User[];
  ledger: LedgerEntry[];
  revenue: RevenueEntry[];
  calls: VerificationCall[];
  audit: AuditEvent[];
  
  setCurrentUser: (userId: string | null) => void;
  getWalletBalance: (walletKey: string) => number;
  addLedgerEntry: (entry: Omit<LedgerEntry, 'id' | 'balanceAfter' | 'createdAt'>) => LedgerEntry;
  addRevenueEntry: (entry: Omit<RevenueEntry, 'id' | 'createdAt'>) => RevenueEntry;
  addAuditLog: (entry: Omit<AuditEvent, 'id' | 'createdAt'>) => void;
  runVerification: (num: string, type: 'NIN'|'BVN'|'Phone→NIN') => any;
  createOrg: (name: string, type: OrgType) => void;
  createOutlet: (name: string, orgId: string) => void;
  buyCredit: (amount: number) => void;
  resetState: () => void;
}

const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

export const useStore = create<TruvoState>()(
  persist(
    (set, get) => ({
      currentUser: initialUsers[1],
      orgs: initialOrgs,
      outlets: initialOutlets,
      users: initialUsers,
      ledger: [],
      revenue: [],
      calls: [],
      audit: [],

      setCurrentUser: (userId) => {
        const user = get().users.find(u => u.id === userId) || null;
        set({ currentUser: user });
      },

      getWalletBalance: (walletKey) => {
        return get().ledger
          .filter(e => e.walletKey === walletKey)
          .reduce((acc, e) => acc + (e.type === 'debit' ? -e.amount : e.amount), 0);
      },

      addLedgerEntry: (entry) => {
        const id = generateId('led');
        const balanceAfter = get().getWalletBalance(entry.walletKey) + (entry.type === 'debit' ? -entry.amount : entry.amount);
        const newEntry: LedgerEntry = { ...entry, id, balanceAfter, createdAt: new Date().toISOString() };
        set(state => ({ ledger: [newEntry, ...state.ledger] }));
        return newEntry;
      },

      addRevenueEntry: (entry) => {
        const id = generateId('rev');
        const newEntry: RevenueEntry = { ...entry, id, createdAt: new Date().toISOString() };
        set(state => ({ revenue: [newEntry, ...state.revenue] }));
        return newEntry;
      },

      addAuditLog: (entry) => {
        const id = generateId('aud');
        const newEntry: AuditEvent = { ...entry, id, createdAt: new Date().toISOString() };
        set(state => ({ audit: [newEntry, ...state.audit] }));
      },

      runVerification: (num, type) => {
        const user = get().currentUser;
        if (!user) return { ok: false, msg: 'Not authenticated' };
        
        const org = get().orgs.find(o => o.id === user.orgId);
        if (!org) return { ok: false, msg: 'Org not found' };

        const walletKey = org.type === 'institution' ? user.orgId : (user.outletId || user.orgId);
        const rate = org.type === 'agency' ? Math.round(BASE_RATES[type] * AGENCY_MARKUP) : BASE_RATES[type];

        if (!/^\d{11}$/.test(num)) return { ok: false, msg: 'Enter an 11-digit number.' };
        if (get().getWalletBalance(walletKey) < rate) {
          return { ok: false, msg: `Insufficient balance (₦${get().getWalletBalance(walletKey)} < ₦${rate}). Transaction rolled back — no debit, no VerificationCall written.` };
        }

        const debit = get().addLedgerEntry({
          walletKey,
          orgId: user.orgId,
          outletId: user.outletId,
          type: 'debit',
          amount: rate,
          reference: type + ' lookup'
        });

        const nf = num.endsWith('0');
        
        let hash = 5381;
        for (let i = 0; i < num.length; i++) {
          hash = ((hash << 5) + hash + num.charCodeAt(i)) >>> 0;
        }
        const ref = hash.toString(16).padStart(8, '0');

        const call: VerificationCall = {
          id: generateId('call'),
          orgId: user.orgId,
          outletId: user.outletId,
          by: user.name,
          type,
          subjectRef: ref,
          status: nf ? 'not_found' : 'verified',
          ledgerId: debit.id,
          amount: rate,
          createdAt: new Date().toISOString()
        };

        set(state => ({ calls: [call, ...state.calls] }));

        if (nf) {
          get().addLedgerEntry({
            walletKey,
            orgId: user.orgId,
            outletId: user.outletId,
            type: 'refund',
            amount: rate,
            reference: 'refund ' + call.id
          });
        }

        get().addAuditLog({
          actor: user.name,
          action: 'verification.' + call.status,
          entity: call.id,
          orgId: user.orgId
        });

        const s = num.split('').reduce((a, x) => a + parseInt(x, 10), 0);
        const names = ['Adaeze N. Okonkwo', 'Ibrahim K. Musa', 'Folasade A. Bello', 'Chinedu P. Eze', 'Zainab M. Yusuf', 'Oluwaseun T. Adeyemi'];
        
        return {
          ok: true,
          call,
          nf,
          rate,
          result: nf ? null : {
            name: names[s % 6],
            dob: '19' + (80 + s % 20) + '-••-••',
            phone: `080${num[1]}•••${num.slice(-4)}`
          }
        };
      },

      createOrg: (name, type) => {
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 20);
        const user = get().currentUser;
        if (!user) return;
        
        const newOrg: Org = {
          id,
          name,
          type,
          schema: 'org_' + id,
          role: 'rl_' + id,
          status: 'active'
        };
        set(state => ({ orgs: [...state.orgs, newOrg] }));
        get().addAuditLog({
          actor: user.name,
          action: 'organization.created',
          entity: name,
          orgId: id
        });
      },

      createOutlet: (name, orgId) => {
        const user = get().currentUser;
        if (!user) return;
        
        const newOutlet: Outlet = {
          id: generateId('o'),
          orgId,
          name
        };
        set(state => ({ outlets: [...state.outlets, newOutlet] }));
        get().addAuditLog({
          actor: user.name,
          action: 'outlet.created',
          entity: name,
          orgId
        });
      },

      buyCredit: (amount) => {
        const user = get().currentUser;
        if (!user) return;
        
        const org = get().orgs.find(o => o.id === user.orgId);
        if (!org) return;

        if (user.role === 'outlet_owner') {
          if (get().getWalletBalance(org.id) < amount) {
            throw new Error('PayGate Agency has insufficient credit to resell this amount.');
          }
          get().addLedgerEntry({
            walletKey: org.id,
            orgId: org.id,
            outletId: null,
            type: 'debit',
            amount,
            reference: 'resale→' + user.outletId
          });
          get().addLedgerEntry({
            walletKey: user.outletId!,
            orgId: org.id,
            outletId: user.outletId,
            type: 'credit',
            amount,
            reference: 'bought from agency'
          });
          get().addRevenueEntry({
            orgId: org.id,
            kind: 'resale (visibility)',
            amount,
            reference: '→' + user.outletId
          });
          get().addAuditLog({
            actor: user.name,
            action: 'wallet.credit',
            entity: user.outletId!,
            orgId: org.id
          });
        } else {
          const ref = 'PSK-' + Math.floor(7000 + Math.random() * 1000);
          get().addLedgerEntry({
            walletKey: org.id,
            orgId: org.id,
            outletId: null,
            type: 'credit',
            amount,
            reference: ref
          });
          get().addRevenueEntry({
            orgId: org.id,
            kind: 'credit sale',
            amount,
            reference: ref
          });
          get().addAuditLog({
            actor: user.name,
            action: 'wallet.credit',
            entity: org.name,
            orgId: org.id
          });
        }
      },

      resetState: () => {
        set({
          orgs: initialOrgs,
          outlets: initialOutlets,
          users: initialUsers,
          ledger: [],
          revenue: [],
          calls: [],
          audit: []
        });
        // Seed initial data
        const store = get();
        
        const sale = (w: string, o: string, a: number, ref: string) => {
          store.addLedgerEntry({ walletKey: w, orgId: o, outletId: null, type: 'credit', amount: a, reference: ref });
          store.addRevenueEntry({ orgId: o, kind: 'credit sale', amount: a, reference: ref });
        };
        sale('lagoon', 'lagoon', 30000, 'PSK-7731');
        sale('kora', 'kora', 10000, 'PSK-7732');
        sale('paygate', 'paygate', 100000, 'FLW-2208');

        [['o3', 6000], ['o4', 2500]].forEach(([o, a]) => {
          store.addLedgerEntry({ walletKey: 'paygate', orgId: 'paygate', outletId: null, type: 'debit', amount: a as number, reference: 'resale→' + o });
          store.addLedgerEntry({ walletKey: o as string, orgId: 'paygate', outletId: o as string, type: 'credit', amount: a as number, reference: 'agency resale' });
          store.addRevenueEntry({ orgId: 'paygate', kind: 'resale (visibility)', amount: a as number, reference: '→' + o });
        });
        
        // Simulating verifications
        store.setCurrentUser('u3'); store.runVerification('12345678901', 'NIN');
        store.setCurrentUser('u5'); store.runVerification('98765432101', 'NIN');
        store.runVerification('55443322110', 'BVN');

        store.addAuditLog({ actor: 'Amaka Eze', action: 'organization.created', entity: 'Lagoon Hotels', orgId: 'lagoon' });
        store.addAuditLog({ actor: 'Amaka Eze', action: 'organization.created', entity: 'PayGate Agency', orgId: 'paygate' });
        store.addAuditLog({ actor: 'Ngozi Obi', action: 'outlet.created', entity: 'Mama Cass Café', orgId: 'paygate' });
        
        store.setCurrentUser('u2'); // Default back to inst admin
      }
    }),
    {
      name: 'truvo-storage',
      onRehydrateStorage: () => (state) => {
        if (state && state.ledger.length === 0) {
          state.resetState();
        }
      }
    }
  )
);
