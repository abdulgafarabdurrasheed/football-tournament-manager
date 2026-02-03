import type { TournamentManager, Match, MatchInsert } from '@/types/tournament.types'

interface Participant {
  id: string
  teamName: string
  seed?: number
  groupNumber?: number
}

interface FixtureOptions {
  doubleLeg?: boolean
  tournamentId: string
}

interface GroupFixtureOptions extends FixtureOptions {
  groupSize: number
  teamsAdvancing: number
}

interface KnockoutFixtureOptions extends FixtureOptions {
  hasThirdPlace?: boolean
}

interface RawFixture {
  home: Participant
  away: Participant
  round: number
  leg: number
}

export function generateRoundRobin(
  participants: Participant[],
  doubleLeg: boolean = true
): RawFixture[] {
  const fixtures: RawFixture[] = []

  const teams = [...participants]
  const hasBye = teams.length % 2 !== 0
  if (hasBye) {
    teams.push({ id: 'BYE', teamName: 'BYE' })
  }
  
  const n = teams.length
  const rounds = n - 1
  
  const rotation = teams.slice(1)
  
  for (let round = 0; round < rounds; round++) {
    const firstHome = round % 2 === 0 ? teams[0] : rotation[0]
    const firstAway = round % 2 === 0 ? rotation[0] : teams[0]
    
    if (firstHome.id !== 'BYE' && firstAway.id !== 'BYE') {
      fixtures.push({
        home: firstHome,
        away: firstAway,
        round: round + 1,
        leg: 1,
      })
    }
    
    for (let i = 1; i < n / 2; i++) {
      const home = rotation[i]
      const away = rotation[n - 1 - i]
      
      if (home.id !== 'BYE' && away.id !== 'BYE') {
        fixtures.push({
          home,
          away,
          round: round + 1,
          leg: 1,
        })
      }
    }
    
    rotation.unshift(rotation.pop()!)
  }

  if (doubleLeg) {
    const firstLegCount = fixtures.length
    for (let i = 0; i < firstLegCount; i++) {
      const original = fixtures[i]
      fixtures.push({
        home: original.away,
        away: original.home,
        round: original.round + rounds,
        leg: 2,
      })
    }
  }
  
  return fixtures
}

type KnockoutRound = 
  | 'ROUND_OF_64'
  | 'ROUND_OF_32' 
  | 'ROUND_OF_16'
  | 'QUARTER_FINAL'
  | 'SEMI_FINAL'
  | 'THIRD_PLACE'
  | 'FINAL'

const KNOCKOUT_ROUND_NAMES: Record<number, KnockoutRound> = {
  64: 'ROUND_OF_64',
  32: 'ROUND_OF_32',
  16: 'ROUND_OF_16',
  8: 'QUARTER_FINAL',
  4: 'SEMI_FINAL',
  2: 'FINAL',
}

export function generateKnockoutBracket(
  participants: Participant[],
  options: KnockoutFixtureOptions
): MatchInsert[] {
  const { tournamentId, hasThirdPlace = false } = options
  
  const bracketSize = nearestPowerOfTwo(participants.length)
  const seededTeams = seedParticipants(participants, bracketSize)
  
  const matches: MatchInsert[] = []
  let bracketPosition = 1
  let currentRoundTeams = bracketSize
  let roundNumber = 1

  const firstRoundMatches: MatchInsert[] = []
  for (let i = 0; i < bracketSize / 2; i++) {
    const home = seededTeams[i * 2]
    const away = seededTeams[i * 2 + 1]
    
    const match: MatchInsert = {
      tournament_id: tournamentId,
      home_manager_id: home?.id !== 'BYE' ? home?.id : null,
      away_manager_id: away?.id !== 'BYE' ? away?.id : null,
      match_type: 'KNOCKOUT',
      round: roundNumber,
      knockout_round: KNOCKOUT_ROUND_NAMES[bracketSize] || 'ROUND_OF_16',
      bracket_position: bracketPosition++,
      status: 'SCHEDULED',
    }

    if (home?.id === 'BYE' || !home) {
      match.status = 'COMPLETED'
      match.winner_id = away?.id
      match.home_score = 0
      match.away_score = 3
    } else if (away?.id === 'BYE' || !away) {
      match.status = 'COMPLETED'
      match.winner_id = home?.id
      match.home_score = 3
      match.away_score = 0
    }
    
    firstRoundMatches.push(match)
  }
  
  matches.push(...firstRoundMatches)
  currentRoundTeams /= 2
  roundNumber++

  while (currentRoundTeams > 1) {
    const roundName = KNOCKOUT_ROUND_NAMES[currentRoundTeams] || 'KNOCKOUT'
    
    for (let i = 0; i < currentRoundTeams / 2; i++) {
      matches.push({
        tournament_id: tournamentId,
        home_manager_id: null,
        away_manager_id: null,
        match_type: currentRoundTeams === 2 ? 'FINAL' : 'KNOCKOUT',
        round: roundNumber,
        knockout_round: roundName,
        bracket_position: bracketPosition++,
        status: 'SCHEDULED',
      })
    }
    
    currentRoundTeams /= 2
    roundNumber++
  }
  
  if (hasThirdPlace && bracketSize >= 4) {
    matches.push({
      tournament_id: tournamentId,
      home_manager_id: null,
      away_manager_id: null,
      match_type: 'THIRD_PLACE',
      round: roundNumber - 1,
      knockout_round: 'THIRD_PLACE',
      bracket_position: bracketPosition,
      status: 'SCHEDULED',
    })
  }
  
  return matches
}

function seedParticipants(
  participants: Participant[],
  bracketSize: number
): (Participant | null)[] {
  const seeded: (Participant | null)[] = new Array(bracketSize).fill(null)

  const sorted = [...participants].sort((a, b) => 
    (a.seed ?? Infinity) - (b.seed ?? Infinity)
  )

  const positions = generateSeedPositions(bracketSize)

  for (let i = 0; i < sorted.length; i++) {
    seeded[positions[i]] = sorted[i]
  }
  
  return seeded
}

function generateSeedPositions(size: number): number[] {
  if (size === 1) return [0]
  if (size === 2) return [0, 1]
  
  const smaller = generateSeedPositions(size / 2)
  const result: number[] = []
  
  for (const pos of smaller) {
    result.push(pos * 2)
    result.push(size - 1 - pos * 2)
  }
  
  return result
}

export function generateHybridMultiGroup(
  participants: Participant[],
  options: GroupFixtureOptions
): MatchInsert[] {
  const { tournamentId, groupSize, teamsAdvancing, doubleLeg = true } = options
  
  const numGroups = Math.ceil(participants.length / groupSize)
  const groups: Participant[][] = []
  
  const sorted = [...participants].sort((a, b) => 
    (a.seed ?? Infinity) - (b.seed ?? Infinity)
  )
  
  for (let i = 0; i < numGroups; i++) {
    groups.push([])
  }
  
  sorted.forEach((participant, index) => {
    const row = Math.floor(index / numGroups)
    const col = row % 2 === 0 
      ? index % numGroups 
      : numGroups - 1 - (index % numGroups)
    groups[col].push({ ...participant, groupNumber: col + 1 })
  })
  
  const matches: MatchInsert[] = []

  groups.forEach((group, groupIndex) => {
    const groupFixtures = generateRoundRobin(group, doubleLeg)
    
    groupFixtures.forEach((fixture) => {
      matches.push({
        tournament_id: tournamentId,
        home_manager_id: fixture.home.id,
        away_manager_id: fixture.away.id,
        match_type: 'GROUP',
        round: fixture.round,
        leg: fixture.leg,
        group_number: groupIndex + 1,
        status: 'SCHEDULED',
      })
    })
  })

  const knockoutSize = nearestPowerOfTwo(numGroups * teamsAdvancing)
  const totalGroupRounds = doubleLeg 
    ? (groupSize - 1) * 2 
    : groupSize - 1
  
  let knockoutRound = totalGroupRounds + 1
  let bracketPosition = 1
  let currentSize = knockoutSize
  
  while (currentSize > 1) {
    const roundName = KNOCKOUT_ROUND_NAMES[currentSize] || 'KNOCKOUT'
    
    for (let i = 0; i < currentSize / 2; i++) {
      matches.push({
        tournament_id: tournamentId,
        home_manager_id: null,
        away_manager_id: null,
        match_type: currentSize === 2 ? 'FINAL' : 'KNOCKOUT',
        round: knockoutRound,
        knockout_round: roundName,
        bracket_position: bracketPosition++,
        status: 'SCHEDULED',
      })
    }
    
    currentSize /= 2
    knockoutRound++
  }
  
  return matches
}

export function generateHybridSingleLeague(
  participants: Participant[],
  options: GroupFixtureOptions
): MatchInsert[] {
  const { tournamentId, teamsAdvancing, doubleLeg = false } = options
  
  const matches: MatchInsert[] = []

  const leagueFixtures = generateRoundRobin(participants, doubleLeg)
  
  leagueFixtures.forEach((fixture) => {
    matches.push({
      tournament_id: tournamentId,
      home_manager_id: fixture.home.id,
      away_manager_id: fixture.away.id,
      match_type: 'GROUP',
      round: fixture.round,
      leg: fixture.leg,
      status: 'SCHEDULED',
    })
  })
  
  const knockoutSize = nearestPowerOfTwo(teamsAdvancing)
  const totalLeagueRounds = doubleLeg 
    ? (participants.length - 1) * 2 
    : participants.length - 1
  
  let knockoutRound = totalLeagueRounds + 1
  let bracketPosition = 1
  let currentSize = knockoutSize
  
  while (currentSize > 1) {
    const roundName = KNOCKOUT_ROUND_NAMES[currentSize] || 'KNOCKOUT'
    
    for (let i = 0; i < currentSize / 2; i++) {
      matches.push({
        tournament_id: tournamentId,
        home_manager_id: null,
        away_manager_id: null,
        match_type: currentSize === 2 ? 'FINAL' : 'KNOCKOUT',
        round: knockoutRound,
        knockout_round: roundName,
        bracket_position: bracketPosition++,
        status: 'SCHEDULED',
      })
    }
    
    currentSize /= 2
    knockoutRound++
  }
  
  return matches
}


function nearestPowerOfTwo(n: number): number {
  let power = 1
  while (power < n) {
    power *= 2
  }
  return power
}

export function generateFixtures(
  format: 'LEAGUE' | 'KNOCKOUT' | 'HYBRID_MULTI_GROUP' | 'HYBRID_SINGLE_LEAGUE',
  participants: Participant[],
  options: GroupFixtureOptions & KnockoutFixtureOptions
): MatchInsert[] {
  switch (format) {
    case 'LEAGUE':
      return generateRoundRobin(participants, options.doubleLeg ?? true)
        .map((fixture) => ({
          tournament_id: options.tournamentId,
          home_manager_id: fixture.home.id,
          away_manager_id: fixture.away.id,
          match_type: 'GROUP' as const,
          round: fixture.round,
          leg: fixture.leg,
          status: 'SCHEDULED' as const,
        }))
    
    case 'KNOCKOUT':
      return generateKnockoutBracket(participants, options)
    
    case 'HYBRID_MULTI_GROUP':
      return generateHybridMultiGroup(participants, options)
    
    case 'HYBRID_SINGLE_LEAGUE':
      return generateHybridSingleLeague(participants, options)
    
    default:
      throw new Error(`Unknown format: ${format}`)
  }
}

export function getNextKnockoutMatch(
  allMatches: Match[],
  completedMatch: Match
): Match | null {
  if (completedMatch.match_type === 'FINAL' || completedMatch.match_type === 'THIRD_PLACE') {
    return null
  }
  
  const currentPosition = completedMatch.bracket_position!
  const nextPosition = Math.floor((currentPosition + 1) / 2)
  
  return allMatches.find(m => 
    m.round === completedMatch.round + 1 &&
    m.bracket_position === nextPosition &&
    m.match_type !== 'THIRD_PLACE'
  ) ?? null
}

export function getWinnerSlot(bracketPosition: number): 'home' | 'away' {
  return bracketPosition % 2 === 1 ? 'home' : 'away'
}