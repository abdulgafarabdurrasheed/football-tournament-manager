-- ============================================================
-- TOURNAMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    format TEXT NOT NULL CHECK (format IN ('LEAGUE', 'KNOCKOUT', 'HYBRID_MULTI_GROUP', 'HYBRID_SINGLE_LEAGUE')),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'OPEN', 'IN_PROGRESS', 'KNOCKOUT_STAGE', 'COMPLETED', 'CANCELLED')),
    visibility TEXT NOT NULL DEFAULT 'PRIVATE' CHECK (visibility IN ('PUBLIC', 'PRIVATE', 'INVITE_ONLY')),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{
        "pointsForWin": 3,
        "pointsForDraw": 1,
        "pointsForLoss": 0,
        "legsPerMatch": 2,
        "groupSize": 4,
        "teamsAdvancing": 2,
        "hasThirdPlace": false,
        "tiebreakers": ["goalDifference", "goalsScored", "headToHead"]
    }'::jsonb,
    max_participants INTEGER NOT NULL DEFAULT 8,
    current_round INTEGER NOT NULL DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Anyone can view public tournaments
CREATE POLICY "Public tournaments are viewable by all"
    ON public.tournaments FOR SELECT
    USING (visibility = 'PUBLIC' OR creator_id = auth.uid());

-- Creators can insert their own tournaments
CREATE POLICY "Users can create tournaments"
    ON public.tournaments FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own tournaments
CREATE POLICY "Creators can update own tournaments"
    ON public.tournaments FOR UPDATE
    USING (auth.uid() = creator_id);

-- Creators can delete their own tournaments
CREATE POLICY "Creators can delete own tournaments"
    ON public.tournaments FOR DELETE
    USING (auth.uid() = creator_id);

CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON public.tournaments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TOURNAMENT MANAGERS (participants)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tournament_managers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    group_number INTEGER,
    seed INTEGER,
    role TEXT NOT NULL DEFAULT 'PLAYER' CHECK (role IN ('OWNER', 'ADMIN', 'PLAYER')),
    stats JSONB NOT NULL DEFAULT '{
        "played": 0,
        "won": 0,
        "drawn": 0,
        "lost": 0,
        "goalsFor": 0,
        "goalsAgainst": 0,
        "points": 0,
        "form": []
    }'::jsonb,
    gameplan_id UUID REFERENCES public.gameplans(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'ELIMINATED', 'WITHDRAWN')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tournament_id, user_id)
);

ALTER TABLE public.tournament_managers ENABLE ROW LEVEL SECURITY;

-- Managers in the tournament can view other managers
CREATE POLICY "Tournament participants can view managers"
    ON public.tournament_managers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tournaments t
            WHERE t.id = tournament_id
            AND (t.visibility = 'PUBLIC' OR t.creator_id = auth.uid())
        )
        OR user_id = auth.uid()
    );

-- Users can join tournaments (insert themselves)
CREATE POLICY "Users can join tournaments"
    ON public.tournament_managers FOR INSERT
    WITH CHECK (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.tournaments t
        WHERE t.id = tournament_id AND t.creator_id = auth.uid()
    ));

-- Tournament owners and the user themselves can update
CREATE POLICY "Managers can be updated by owner or self"
    ON public.tournament_managers FOR UPDATE
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.tournaments t
            WHERE t.id = tournament_id AND t.creator_id = auth.uid()
        )
    );

-- Tournament owners can remove managers
CREATE POLICY "Owners can remove managers"
    ON public.tournament_managers FOR DELETE
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.tournaments t
            WHERE t.id = tournament_id AND t.creator_id = auth.uid()
        )
    );

-- ============================================================
-- MATCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    home_manager_id UUID REFERENCES public.tournament_managers(id) ON DELETE SET NULL,
    away_manager_id UUID REFERENCES public.tournament_managers(id) ON DELETE SET NULL,
    match_type TEXT NOT NULL DEFAULT 'GROUP' CHECK (match_type IN ('GROUP', 'KNOCKOUT', 'THIRD_PLACE', 'FINAL')),
    round INTEGER NOT NULL DEFAULT 1,
    leg INTEGER NOT NULL DEFAULT 1,
    group_number INTEGER,
    bracket_position INTEGER,
    knockout_round TEXT,
    home_score INTEGER,
    away_score INTEGER,
    home_aggregate INTEGER,
    away_aggregate INTEGER,
    home_extra_time INTEGER,
    away_extra_time INTEGER,
    home_penalties INTEGER,
    away_penalties INTEGER,
    decided_by TEXT CHECK (decided_by IN ('NORMAL', 'EXTRA_TIME', 'PENALTIES', 'AWAY_GOALS')),
    status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'POSTPONED', 'CANCELLED')),
    winner_id UUID REFERENCES public.tournament_managers(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ,
    played_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches viewable by tournament participants"
    ON public.matches FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tournaments t
            WHERE t.id = tournament_id
            AND (t.visibility = 'PUBLIC' OR t.creator_id = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.tournament_managers tm
            WHERE tm.tournament_id = matches.tournament_id AND tm.user_id = auth.uid()
        )
    );

CREATE POLICY "Tournament owners can manage matches"
    ON public.matches FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tournaments t
            WHERE t.id = tournament_id AND t.creator_id = auth.uid()
        )
    );

CREATE POLICY "Tournament owners can update matches"
    ON public.matches FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.tournaments t
            WHERE t.id = tournament_id AND t.creator_id = auth.uid()
        )
    );

CREATE POLICY "Tournament owners can delete matches"
    ON public.matches FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.tournaments t
            WHERE t.id = tournament_id AND t.creator_id = auth.uid()
        )
    );

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- PLAYER STATS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES public.tournament_managers(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    player_position TEXT,
    goals INTEGER NOT NULL DEFAULT 0,
    assists INTEGER NOT NULL DEFAULT 0,
    own_goals INTEGER NOT NULL DEFAULT 0,
    yellow_cards INTEGER NOT NULL DEFAULT 0,
    red_cards INTEGER NOT NULL DEFAULT 0,
    minutes_played INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(3,1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Player stats viewable by tournament participants"
    ON public.player_stats FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.matches m
            JOIN public.tournaments t ON t.id = m.tournament_id
            WHERE m.id = match_id
            AND (t.visibility = 'PUBLIC' OR t.creator_id = auth.uid())
        )
    );

CREATE POLICY "Managers can insert own player stats"
    ON public.player_stats FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tournament_managers tm
            WHERE tm.id = manager_id AND tm.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.matches m
            JOIN public.tournaments t ON t.id = m.tournament_id
            WHERE m.id = match_id AND t.creator_id = auth.uid()
        )
    );

CREATE POLICY "Managers can update own player stats"
    ON public.player_stats FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.tournament_managers tm
            WHERE tm.id = manager_id AND tm.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.matches m
            JOIN public.tournaments t ON t.id = m.tournament_id
            WHERE m.id = match_id AND t.creator_id = auth.uid()
        )
    );

CREATE POLICY "Managers can delete own player stats"
    ON public.player_stats FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.tournament_managers tm
            WHERE tm.id = manager_id AND tm.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.matches m
            JOIN public.tournaments t ON t.id = m.tournament_id
            WHERE m.id = match_id AND t.creator_id = auth.uid()
        )
    );

-- ============================================================
-- TOURNAMENT INVITES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tournament_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    invite_type TEXT NOT NULL CHECK (invite_type IN ('EMAIL', 'CODE')),
    email TEXT,
    code TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED')),
    accepted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ
);

ALTER TABLE public.tournament_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invites viewable by tournament owner or invitee"
    ON public.tournament_invites FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tournaments t
            WHERE t.id = tournament_id AND t.creator_id = auth.uid()
        )
        OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY "Tournament owners can create invites"
    ON public.tournament_invites FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tournaments t
            WHERE t.id = tournament_id AND t.creator_id = auth.uid()
        )
    );

CREATE POLICY "Invites can be updated by owner or invitee"
    ON public.tournament_invites FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.tournaments t
            WHERE t.id = tournament_id AND t.creator_id = auth.uid()
        )
        OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY "Tournament owners can delete invites"
    ON public.tournament_invites FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.tournaments t
            WHERE t.id = tournament_id AND t.creator_id = auth.uid()
        )
    );

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tournaments_creator ON public.tournaments(creator_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_managers_tournament ON public.tournament_managers(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_managers_user ON public.tournament_managers(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON public.matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_player_stats_match ON public.player_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_manager ON public.player_stats(manager_id);
CREATE INDEX IF NOT EXISTS idx_tournament_invites_tournament ON public.tournament_invites(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_invites_email ON public.tournament_invites(email);
