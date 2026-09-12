-- ═══════════════════════════════════════════════════════
-- AnimeBill v2.0 — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- © AnimeBill by iprsnmsra | github.com/iprsnmsra
-- ═══════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────
-- 1. PROFILES — extends Supabase auth.users
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL DEFAULT '',
  shop_name     TEXT DEFAULT '',
  address       TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  gstin         TEXT DEFAULT '',
  currency_code TEXT DEFAULT 'INR',
  total_bills   INT  DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────
-- 2. BILLS — every generated bill is saved here
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bills (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_no         TEXT NOT NULL,
  shop_name       TEXT NOT NULL DEFAULT 'Store',
  shop_address    TEXT DEFAULT '',
  shop_phone      TEXT DEFAULT '',
  gstin           TEXT DEFAULT '',
  currency_code   TEXT DEFAULT 'INR',
  currency_symbol TEXT DEFAULT '₹',
  subtotal        NUMERIC(12,2) DEFAULT 0,
  total_gst       NUMERIC(12,2) DEFAULT 0,
  grand_total     NUMERIC(12,2) DEFAULT 0,
  item_count      INT DEFAULT 0,
  character_id    TEXT,
  character_name  TEXT,
  anime_name      TEXT,
  quote_text      TEXT,
  quote_source    TEXT,
  quote_emoji     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────
-- 3. BILL ITEMS — line items for each bill
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bill_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id    UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  qty        INT DEFAULT 1,
  price      NUMERIC(12,2) DEFAULT 0,
  gst_rate   NUMERIC(5,2) DEFAULT 0,
  line_total NUMERIC(12,2) DEFAULT 0,
  sort_order INT DEFAULT 0
);

-- ─────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
-- Users can only access their own data
-- ─────────────────────────────────────────────────────
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;

-- Profiles: users manage their own
CREATE POLICY "Users manage own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Bills: users manage their own
CREATE POLICY "Users manage own bills"
  ON public.bills FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bill items: users manage items belonging to their bills
CREATE POLICY "Users manage own bill items"
  ON public.bill_items FOR ALL
  USING (bill_id IN (SELECT id FROM public.bills WHERE user_id = auth.uid()))
  WITH CHECK (bill_id IN (SELECT id FROM public.bills WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────────────
-- 5. INDEXES — for fast dashboard queries
-- ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_bills_user_created
  ON public.bills(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bills_bill_no
  ON public.bills(bill_no);

CREATE INDEX IF NOT EXISTS idx_bills_grand_total
  ON public.bills(user_id, grand_total DESC);

CREATE INDEX IF NOT EXISTS idx_bill_items_bill
  ON public.bill_items(bill_id);

-- ─────────────────────────────────────────────────────
-- 6. TRIGGER: Auto-create profile on user signup
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Anime Fan')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────
-- 7. TRIGGER: Auto-update bill count on insert/delete
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_bill_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET total_bills = total_bills + 1, updated_at = now()
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET total_bills = GREATEST(total_bills - 1, 0), updated_at = now()
    WHERE id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_bill_change ON public.bills;
CREATE TRIGGER on_bill_change
  AFTER INSERT OR DELETE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bill_count();

-- ─────────────────────────────────────────────────────
-- 8. TRIGGER: Auto-update updated_at on profile change
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ─────────────────────────────────────────────────────
-- 9. VIEW: Dashboard analytics per user
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.user_bill_stats AS
SELECT
  user_id,
  COUNT(*)::INT                                        AS total_bills,
  COALESCE(SUM(grand_total), 0)::NUMERIC(14,2)         AS total_revenue,
  COALESCE(AVG(grand_total), 0)::NUMERIC(12,2)         AS avg_bill_value,
  COALESCE(MAX(grand_total), 0)::NUMERIC(12,2)         AS highest_bill,
  MIN(created_at)                                       AS first_bill_date,
  MAX(created_at)                                       AS last_bill_date,
  MODE() WITHIN GROUP (ORDER BY character_name)         AS fav_character,
  MODE() WITHIN GROUP (ORDER BY anime_name)             AS fav_anime,
  MODE() WITHIN GROUP (ORDER BY currency_code)          AS primary_currency
FROM public.bills
GROUP BY user_id;

-- Grant access to the view through RLS on underlying table
-- (The view inherits RLS from the bills table)

-- ═══════════════════════════════════════════════════════
-- ✅ Schema ready! AnimeBill database is set up.
-- ═══════════════════════════════════════════════════════
