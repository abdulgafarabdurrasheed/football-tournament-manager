import type { Match, TournamentManager, ManagerStats } from '@/types/tournament.types'

type FormResult = 'W' | 'D' | 'L'
export function getFormGuide(
    managerId: string,
    matches: Match[],
    count: number = 5
): FormResult[] {
    const managerMatches = matches
        .filter(m => 
            m.status === 'COMPLETED' &&
             (m.home_manager_id === managerId || m.away_manager_id === managerId)
            )
        .sort((a, b) => {
            const dateA = a.played_at ? new Date(a.played_at).getTime() : 0
            const dateB = b.played_at ? new Date(b.played_at).getTime() : 0
            return dateB - dateA
        })
        .slice(0, count)

    return managerMatches.map(match => {
        const isHome = match.home_manager_id === managerId
        const scored = isHome ? match.home_score! : match.away_score!
        const conceded = isHome ? match.away_score! : match.home_score!

        if (scored > conceded) return 'W'
        if (scored < conceded) return 'L'
        return 'D'
    })
}

interface H2HStats {
    managerAWins: number
    managerBWins: number
    draws: number
    managerAGoals: number
    managerBGoals: number
    matches: Match[]
}

export function getH2HStats(
    managerAId: string,
    managerBId: string,
    matches: Match[]
): H2HStats {
    const h2hMatches = matches.filter(m => 
        m.status === 'COMPLETED' &&
        ((m.home_manager_id === managerAId && m.away_manager_id === managerBId) ||
         (m.home_manager_id === managerBId && m.away_manager_id === managerAId))
    )

    let managerAWins = 0
    let managerBWins = 0
    let draws = 0
    let managerAGoals = 0
    let managerBGoals = 0

    h2hMatches.forEach(match => {
        const aIsHome = match.home_manager_id === managerAId
        const aScore = aIsHome ? match.home_score! : match.away_score!
        const bScore = aIsHome ? match.away_score! : match.home_score!

        managerAGoals += aScore
        managerBGoals += bScore

        if(aScore > bScore) managerAWins++
        else if(bScore > aScore) managerBWins++
        else draws++
    })
    return {
        managerAWins,
        managerBWins,
        draws,
        managerAGoals,
        managerBGoals,
        matches: h2hMatches
    }
}

interface StandingsEntry{
    manager: TournamentManager
    played: number
    won: number
    drawn: number
    lost: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
    points: number
    form: FormResult[]
}

export function calculateStandings(
    managers: TournamentManager[],
    matches: Match[],
    pointsForWin: number = 3,
    pointsForDraw: number = 1
): StandingsEntry[] {
    const standings: Map<string, StandingsEntry> = new Map()

    managers.forEach(manager => {
        standings.set(manager.id, {
            manager,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            form: [],
        })
    })

    const completedMatches = matches
        .filter(m => m.status === 'COMPLETED' && m.match_type === 'GROUP')
        .sort((a, b) => {
            const dateA = a.played_at ? new Date(a.played_at).getTime() : 0
            const dateB = b.played_at ? new Date(b.played_at).getTime() : 0
            return dateA - dateB
        })
    completedMatches.forEach(match => {
        const homeEntry = standings.get(match.home_manager_id!)
        const awayEntry = standings.get(match.away_manager_id!)

        if (!homeEntry || !awayEntry) return

        const homeScore = match.home_score!
        const awayScore = match.away_score!

        homeEntry.played++
        homeEntry.goalsFor += homeScore
        homeEntry.goalsAgainst += awayScore
        homeEntry.goalDifference = homeEntry.goalsFor - homeEntry.goalsAgainst

        awayEntry.played++
        awayEntry.goalsFor += awayScore
        awayEntry.goalsAgainst += homeScore
        awayEntry.goalDifference = awayEntry.goalsFor - awayEntry.goalsAgainst

        if (homeScore > awayScore) {
            homeEntry.won++
            homeEntry.points += pointsForWin
            homeEntry.form.push('W')

            awayEntry.lost++
            awayEntry.form.push('L')
        } else if (awayScore > homeScore) {
            awayEntry.won++
            awayEntry.points += pointsForWin
            awayEntry.form.push('W')

            homeEntry.lost++
            homeEntry.form.push('L')
        } else {
            homeEntry.drawn++
            homeEntry.points += pointsForDraw
            homeEntry.form.push('D')

            awayEntry.drawn++
            awayEntry.points += pointsForDraw
            awayEntry.form.push('D')
        }
    })

    standings.forEach(entry => {
       entry.form = entry.form.slice(-5)
    })

    return Array.from(standings.values()).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
        return a.manager.team_name.localeCompare(b.manager.team_name)
    })
}

export function calculateGroupStandings(
    managers: TournamentManager[],
    matches: Match[],
    pointsForWin: number = 3,
    pointsForDraw: number = 1
): Map<number, StandingsEntry[]> {
    const groups = new Map<number, StandingsEntry[]>()

    const managersByGroup = new Map<number, TournamentManager[]>()
    managers.forEach(m => {
        if (m.group_number){
            const group = managersByGroup.get(m.group_number) || []
            group.push(m)
            managersByGroup.set(m.group_number, group)
        }
    })

    managersByGroup.forEach((groupManagers, groupNumber) => {
        const groupMatches = matches.filter(m => m.group_number === groupNumber)
        const standings = calculateStandings(groupManagers, groupMatches, pointsForWin, pointsForDraw)
        groups.set(groupNumber, standings)
    })

    return groups
}

interface RaceDataPoint {
    round: number
    points: number
}

interface RaceData {
    managerId: string
    teamName: string
    data: RaceDataPoint[]
}

export function generateRaceData(
    managers: TournamentManager[],
    matches: Match[],
    pointsForWin: number = 3,
    pointsForDraw: number = 1
): RaceData[] {
    const maxRound = Math.max(
        ...matches
            .filter(m => m.status === 'COMPLETED')
            .map(m => m.round)
    )

    if (maxRound <= 0) return []

    return managers.map(manager => {
        const data: RaceDataPoint[] = []
        let cumulativePoints = 0

        for (let round = 1; round <= maxRound; round++) {
            const roundMatches = matches.filter(m =>
                m.round === round &&
                m.status === 'COMPLETED' &&
                (m.home_manager_id === manager.id || m.away_manager_id === manager.id)
            )
            roundMatches.forEach(match => {
                const isHome = match.home_manager_id === manager.id
                const scored = isHome ? match.home_score! : match.away_score!
                const conceded = isHome ? match.away_score! : match.home_score!

                if (scored > conceded) cumulativePoints += pointsForWin
                else if (scored === conceded) cumulativePoints += pointsForDraw
            })

            data.push({ round, points: cumulativePoints })
        }

        return {
            managerId: manager.id,
            teamName: manager.team_name,
            data,
        }
    })
}

interface PlayerLeaderboard {
    playerName: string
    managerId: string
    teamName: string
    value: number
}

export function getTopScorers(
    playerStats: { player_name: string; manager_id: string; goals: number; }[],
    managers: TournamentManager[],
    limit: number = 10
): PlayerLeaderboard[] {
    const aggregated = new Map<string, { playerName: string; managerId: string; goals: number }>()

    playerStats.forEach(stat => {
        const key = `${stat.manager_id}-${stat.player_name}`
        const existing = aggregated.get(key)

        if(existing) {
            existing.goals += stat.goals
        } else {
            aggregated.set(key, {
                playerName: stat.player_name,
                managerId: stat.manager_id,
                goals: stat.goals,
            })
        }
    })

    return Array.from(aggregated.values())
        .filter(p => p.goals > 0)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, limit)
        .map(p => ({
            playerName: p.playerName,
            managerId: p.managerId,
            teamName: managers.find(m => m.id === p.managerId)?.team_name || 'Unknown',
            value: p.goals,
        }))
}

export function getTopAssists(
    playerStats: { player_name: string; manager_id: string; assists: number }[],
    managers: TournamentManager[],
    limit: number = 10
): PlayerLeaderboard[] {
    const aggregated = new Map<string, { playerName: string; managerId: string; assists: number }>()

    playerStats.forEach(stat => {
        const key = `${stat.manager_id}-${stat.player_name}`
        const existing = aggregated.get(key)

        if(existing) {
            existing.assists += stat.assists
        } else {
            aggregated.set(key, {
                playerName: stat.player_name,
                managerId: stat.manager_id,
                assists: stat.assists,
            })
        }
    })

    return Array.from(aggregated.values())
        .filter(p => p.assists > 0)
        .sort((a, b) => b.assists - a.assists)
        .slice(0, limit)
        .map(p => ({
            playerName: p.playerName,
            managerId: p.managerId,
            teamName: managers.find(m => m.id === p.managerId)?.team_name || 'Unknown',
            value: p.assists
        }))
}

interface MatchStats {
    totalMatches: number
    completedMatches: number
    pendingMatches: number
    totalGoals: number
    avgGoalsPerMatch: number
    highestScoringMatch: Match | null
    cleanSheets: { managerId: string; count: number }[]
}

export function getTournamentStats(
    matches: Match[],
    managers: TournamentManager[]
): MatchStats {
    const completed = matches.filter(m => m.status === 'COMPLETED')
    const totalGoals = completed.reduce((sum, m) => 
        sum + (m.home_score || 0) + (m.away_score || 0), 0)

    const highestScoringMatch = completed.reduce((highest, match) => {
    const matchGoals = (match.home_score || 0) + (match.away_score || 0)
    const highestGoals = highest ? (highest.home_score || 0) + (highest.away_score || 0) : 0
    return matchGoals > highestGoals ? match : highest
  }, null as Match | null)
  
  const cleanSheetCounts = new Map<string, number>()
  managers.forEach(m => cleanSheetCounts.set(m.id, 0))
  
  completed.forEach(match => {
    if (match.away_score === 0 && match.home_manager_id) {
      cleanSheetCounts.set(
        match.home_manager_id, 
        (cleanSheetCounts.get(match.home_manager_id) || 0) + 1
      )
    }
    if (match.home_score === 0 && match.away_manager_id) {
      cleanSheetCounts.set(
        match.away_manager_id,
        (cleanSheetCounts.get(match.away_manager_id) || 0) + 1
      )
    }
  })
  
  const cleanSheets = Array.from(cleanSheetCounts.entries())
    .map(([managerId, count]) => ({ managerId, count }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)
  
  return {
    totalMatches: matches.length,
    completedMatches: completed.length,
    pendingMatches: matches.filter(m => m.status === 'SCHEDULED').length,
    totalGoals,
    avgGoalsPerMatch: completed.length > 0 ? totalGoals / completed.length : 0,
    highestScoringMatch,
    cleanSheets,
  }
}