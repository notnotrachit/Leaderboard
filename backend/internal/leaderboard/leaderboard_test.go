package leaderboard

import (
	"testing"
)

func TestFenwickTree(t *testing.T) {
	ft := NewFenwickTree(10)

	// Update index 1 by 5
	ft.Update(1, 5)
	if sum := ft.PrefixSum(1); sum != 5 {
		t.Errorf("PrefixSum(1) = %d; want 5", sum)
	}

	// Update index 3 by 2
	ft.Update(3, 2)
	// [5, 0, 2, ...]
	if sum := ft.PrefixSum(3); sum != 7 {
		t.Errorf("PrefixSum(3) = %d; want 7", sum)
	}

	// Update index 1 by -2
	ft.Update(1, -2)
	// [3, 0, 2, ...]
	if sum := ft.PrefixSum(3); sum != 5 {
		t.Errorf("PrefixSum(3) = %d; want 5", sum)
	}
}

func TestLeaderboard_TieHandling(t *testing.T) {
	lb := NewLeaderboard()

	// Add users with same rating
	lb.AddUser("alice", 1000)
	lb.AddUser("bob", 1000)

	// Check Alice
	rankA, err := lb.GetUserRank("alice")
	if err != nil {
		t.Fatalf("Failed to get alice: %v", err)
	}
	if rankA.Rank != 1 {
		t.Errorf("Alice rank = %d; want 1", rankA.Rank)
	}

	// Check Bob
	rankB, err := lb.GetUserRank("bob")
	if err != nil {
		t.Fatalf("Failed to get bob: %v", err)
	}
	if rankB.Rank != 1 {
		t.Errorf("Bob rank = %d; want 1", rankB.Rank)
	}

	// Add lower rating user
	lb.AddUser("charlie", 900)
	rankC, err := lb.GetUserRank("charlie")
	if err != nil {
		t.Fatalf("Failed to get charlie: %v", err)
	}
	// Alice(1000), Bob(1000) are above. Count=2. Rank = 2+1 = 3.
	if rankC.Rank != 3 {
		t.Errorf("Charlie rank = %d; want 3", rankC.Rank)
	}

	// Add higher rating user
	lb.AddUser("dave", 1100)
	// Dave(1100) -> Rank 1
	// Alice(1000), Bob(1000) -> Rank 2
	// Charlie(900) -> Rank 4

	rankD, _ := lb.GetUserRank("dave")
	if rankD.Rank != 1 {
		t.Errorf("Dave rank = %d; want 1", rankD.Rank)
	}

	rankA2, _ := lb.GetUserRank("alice")
	if rankA2.Rank != 2 {
		t.Errorf("Alice new rank = %d; want 2", rankA2.Rank)
	}

	rankC2, _ := lb.GetUserRank("charlie")
	if rankC2.Rank != 4 {
		t.Errorf("Charlie new rank = %d; want 4", rankC2.Rank)
	}
}

func TestLeaderboard_GetTopN(t *testing.T) {
	lb := NewLeaderboard()

	// Seed some data
	lb.AddUser("p1", 5000)
	lb.AddUser("p2", 4000)
	lb.AddUser("p3", 4000)
	lb.AddUser("p4", 3000)
	lb.AddUser("p5", 2000)

	// Get Top 3
	top3 := lb.GetTopN(3, 0)
	if len(top3) != 3 {
		t.Fatalf("GetTopN(3) returned %d items", len(top3))
	}

	if top3[0].Username != "p1" || top3[0].Rank != 1 {
		t.Errorf("Item 0 mismatch: %v", top3[0])
	}

	// p2 and p3 can be in any order but both rank 2
	if top3[1].Rank != 2 {
		t.Errorf("Item 1 rank mismatch: %v", top3[1])
	}
	if top3[2].Rank != 2 {
		t.Errorf("Item 2 rank mismatch: %v", top3[2])
	}

	// Pagination: Get next 2 (offset 3)
	next2 := lb.GetTopN(2, 3)
	if len(next2) != 2 {
		t.Fatalf("GetTopN(2, 3) returned %d items", len(next2))
	}

	if next2[0].Username != "p4" || next2[0].Rank != 4 {
		t.Errorf("Item 3 mismatch: %v", next2[0])
	}
	if next2[1].Username != "p5" || next2[1].Rank != 5 {
		t.Errorf("Item 4 mismatch: %v", next2[1])
	}
}

func TestLeaderboard_UpdateRating(t *testing.T) {
	lb := NewLeaderboard()
	lb.AddUser("u1", 1000)

	// Update to 2000
	err := lb.UpdateRating("u1", 2000)
	if err != nil {
		t.Fatalf("UpdateRating failed: %v", err)
	}

	u, _ := lb.GetUserRank("u1")
	if u.Rating != 2000 {
		t.Errorf("Rating = %d; want 2000", u.Rating)
	}

	// Fenwick check (internal)
	// Index for 2000 should have 1, Index for 1000 should have 0
	// 1000 -> Index 1000-100+1 = 901
	// 2000 -> Index 2000-100+1 = 1901

	count1000 := lb.fenwick.RangeSum(901, 901)
	if count1000 != 0 {
		t.Errorf("Fenwick count at 1000 = %d; want 0", count1000)
	}

	count2000 := lb.fenwick.RangeSum(1901, 1901)
	if count2000 != 1 {
		t.Errorf("Fenwick count at 2000 = %d; want 1", count2000)
	}
}
