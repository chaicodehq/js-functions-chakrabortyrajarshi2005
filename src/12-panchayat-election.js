/**
 * 🗳️ Panchayat Election System - Capstone
 *
 * Village ki panchayat election ka system bana! Yeh CAPSTONE challenge hai
 * jisme saare function concepts ek saath use honge:
 * closures, callbacks, HOF, factory, recursion, pure functions.
 *
 * Functions:
 *
 *   1. createElection(candidates)
 *      - CLOSURE: private state (votes object, registered voters set)
 *      - candidates: array of { id, name, party }
 *      - Returns object with methods:
 *
 *      registerVoter(voter)
 *        - voter: { id, name, age }
 *        - Add to private registered set. Return true.
 *        - Agar already registered or voter invalid, return false.
 *        - Agar age < 18, return false.
 *
 *      castVote(voterId, candidateId, onSuccess, onError)
 *        - CALLBACKS: call onSuccess or onError based on result
 *        - Validate: voter registered? candidate exists? already voted?
 *        - If valid: record vote, call onSuccess({ voterId, candidateId })
 *        - If invalid: call onError("reason string")
 *        - Return the callback's return value
 *
 *      getResults(sortFn)
 *        - HOF: takes optional sort comparator function
 *        - Returns array of { id, name, party, votes: count }
 *        - If sortFn provided, sort results using it
 *        - Default (no sortFn): sort by votes descending
 *
 *      getWinner()
 *        - Returns candidate object with most votes
 *        - If tie, return first candidate among tied ones
 *        - If no votes cast, return null
 *
 *   2. createVoteValidator(rules)
 *      - FACTORY: returns a validation function
 *      - rules: { minAge: 18, requiredFields: ["id", "name", "age"] }
 *      - Returned function takes a voter object and returns { valid, reason }
 *
 *   3. countVotesInRegions(regionTree)
 *      - RECURSION: count total votes in nested region structure
 *      - regionTree: { name, votes: number, subRegions: [...] }
 *      - Sum votes from this region + all subRegions (recursively)
 *      - Agar regionTree null/invalid, return 0
 *
 *   4. tallyPure(currentTally, candidateId)
 *      - PURE FUNCTION: returns NEW tally object with incremented count
 *      - currentTally: { "cand1": 5, "cand2": 3, ... }
 *      - Return new object where candidateId count is incremented by 1
 *      - MUST NOT modify currentTally
 *      - If candidateId not in tally, add it with count 1
 *
 * @example
 *   const election = createElection([
 *     { id: "C1", name: "Sarpanch Ram", party: "Janata" },
 *     { id: "C2", name: "Pradhan Sita", party: "Lok" }
 *   ]);
 *   election.registerVoter({ id: "V1", name: "Mohan", age: 25 });
 *   election.castVote("V1", "C1", r => "voted!", e => "error: " + e);
 *   // => "voted!"
 */export function createElection(candidates) {
		const candList = Array.isArray(candidates) ? candidates.slice() : [];
		const candMap = new Map(candList.map((c) => [c.id, c]));
		const votes = {};
		const registered = new Set();
		const voted = new Set();

		return {
			registerVoter(voter) {
				if (
					!voter ||
					typeof voter.id !== 'string' ||
					registered.has(voter.id) ||
					!Number.isFinite(voter.age) ||
					voter.age < 18
				) {
					return false;
				}
				registered.add(voter.id);
				return true;
			},

			castVote(voterId, candidateId, onSuccess, onError) {
				const ok = typeof onSuccess === 'function';
				const err = typeof onError === 'function';

				if (!registered.has(voterId)) {
					return err ? onError('voter_not_registered') : undefined;
				}
				if (!candMap.has(candidateId)) {
					return err ? onError('candidate_not_found') : undefined;
				}
				if (voted.has(voterId)) {
					return err ? onError('already_voted') : undefined;
				}

				votes[candidateId] = (votes[candidateId] || 0) + 1;
				voted.add(voterId);

				return ok ? onSuccess({ voterId, candidateId }) : undefined;
			},

			getResults(sortFn) {
				const res = candList.map((c) => ({
					id: c.id,
					name: c.name,
					party: c.party,
					votes: votes[c.id] || 0,
				}));

				if (typeof sortFn === 'function') {
					return res.slice().sort(sortFn);
				}

				return res.slice().sort((a, b) => b.votes - a.votes);
			},

			getWinner() {
				let max = 0;
				let winner = null;

				for (const c of candList) {
					const v = votes[c.id] || 0;
					if (v > max) {
						max = v;
						winner = c;
					}
				}

				return max === 0 ? null : winner;
			},
		};
 }

 export function createVoteValidator(rules) {
		const minAge = rules?.minAge;
		const req = Array.isArray(rules?.requiredFields)
			? rules.requiredFields
			: [];

		return (voter) => {
			if (!voter || typeof voter !== 'object') {
				return { valid: false, reason: 'invalid_voter' };
			}

			for (const f of req) {
				if (!(f in voter)) {
					return { valid: false, reason: 'missing_' + f };
				}
			}

			if (
				Number.isFinite(minAge) &&
				(!Number.isFinite(voter.age) || voter.age < minAge)
			) {
				return { valid: false, reason: 'underage' };
			}

			return { valid: true, reason: null };
		};
 }

 export function countVotesInRegions(regionTree) {
		if (!regionTree || typeof regionTree !== 'object') return 0;

		const own = Number.isFinite(regionTree.votes) ? regionTree.votes : 0;
		const subs = Array.isArray(regionTree.subRegions)
			? regionTree.subRegions
			: [];

		return own + subs.reduce((sum, r) => sum + countVotesInRegions(r), 0);
 }

 export function tallyPure(currentTally, candidateId) {
		const base =
			currentTally && typeof currentTally === 'object' ? currentTally : {};
		const next = { ...base };
		next[candidateId] = (next[candidateId] || 0) + 1;
		return next;
 }
