package leaderboard

// FenwickTree supports O(log n) prefix sums and point updates
// We use it to count users with rating >= X efficiently
type FenwickTree struct {
	tree []int
	n    int
}

// NewFenwickTree creates a tree for the rating range
func NewFenwickTree(size int) *FenwickTree {
	return &FenwickTree{
		tree: make([]int, size+1), // 1-indexed
		n:    size,
	}
}

// Update adds delta to position i (1-indexed)
// Called when user rating changes: +1 for new rating, -1 for old
func (ft *FenwickTree) Update(i, delta int) {
	for i <= ft.n {
		ft.tree[i] += delta
		i += i & (-i) // Add least significant bit
	}
}

// PrefixSum returns sum of elements [1, i]
// Used to count users with rating <= X
func (ft *FenwickTree) PrefixSum(i int) int {
	sum := 0
	for i > 0 {
		sum += ft.tree[i]
		i -= i & (-i) // Remove least significant bit
	}
	return sum
}

// RangeSum returns sum of elements [l, r]
func (ft *FenwickTree) RangeSum(l, r int) int {
	if l > r {
		return 0
	}
	if l == 1 {
		return ft.PrefixSum(r)
	}
	return ft.PrefixSum(r) - ft.PrefixSum(l-1)
}
