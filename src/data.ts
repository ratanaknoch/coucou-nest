import { AlgorithmicChallenge, DownloadableModel } from "./types";

export const DEFAULT_ALGORITHMS: AlgorithmicChallenge[] = [
  {
    id: "two-sum",
    name: "Two Sum",
    difficulty: "Easy",
    enrolled: false,
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    starterCode: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}`,
    optimalComplexity: "Time: O(N) | Space: O(N)",
    testCases: [
      { input: "nums = [2, 7, 11, 15], target = 9", expected: "[0, 1]" },
      { input: "nums = [3, 2, 4], target = 6", expected: "[1, 2]" },
      { input: "nums = [3, 3], target = 6", expected: "[0, 1]" }
    ],
    steps: [
      { line: 2, label: "Initialize Map", action: "Create a hash map to store visited elements and their index positions.", stateBefore: "nums = [2, 7, 11, 15], target = 9 | Map = undefined", stateAfter: "Map = {} | iFlag = undefined" },
      { line: 4, label: "Loop Step i = 0", action: "Evaluate nums[0] = 2. Compute complement: 9 - 2 = 7.", stateBefore: "Map = {}", stateAfter: "Map = {} | i = 0 | currentVal = 2 | complement = 7" },
      { line: 7, label: "Check Map for '7'", action: "Query hash map. Does it contain the key 7? (Has not been registered yet).", stateBefore: "Map = {} | complement = 7", stateAfter: "Map = {} | complement = 7 | exists = false" },
      { line: 11, label: "Register Index", action: "Insert mapping 2 -> index 0. Advance index.", stateBefore: "Map = {}", stateAfter: "Map = { 2: 0 } | next_iteration = true" },
      { line: 4, label: "Loop Step i = 1", action: "Evaluate nums[1] = 7. Compute complement: 9 - 7 = 2.", stateBefore: "Map = { 2: 0 }", stateAfter: "Map = { 2: 0 } | i = 1 | currentVal = 7 | complement = 2" },
      { line: 7, label: "Check Map for '2'", action: "Query hash map. Does it contain key 2?", stateBefore: "Map = { 2: 0 } | complement = 2", stateAfter: "Map = { 2: 0 } | Match found at indices = [0, 1]" },
      { line: 8, label: "Return Match", action: "Found complement in map at index 0 and current item is at index 1.", stateBefore: "Map = { 2: 0 } | complement = 2", stateAfter: "Returns [0, 1] | Search Completed" }
    ],
    teachingMaterials: {
      introduction: "Learn how to find two numbers in an array that add up to a specific target value using a Hash Map for O(N) linear time efficiency instead of O(N²) brute-force nested loops.",
      keyConcepts: [
        "Hashing: Store values as keys and their indices as values for constant O(1) lookup speed.",
        "Complement Check: For each number 'x', check if 'target - x' has already been stored in our map to make up the target sum.",
        "Single Pass Efficiency: We can populate the map and check for the complement in a single linear pass!"
      ],
      videoPlaceholderText: "In this short lesson, we break down how using an indexed Hash Map turns a quadratic nested iteration into a super-fast linear index lookup. Watch how we look back at visited elements dynamically!"
    },
    quiz: [
      {
        question: "What is the primary benefit of using a Hash Map over nested loops for the Two Sum problem?",
        options: [
          "It guarantees the results are sorted in ascending order.",
          "It reduces the time complexity from O(N²) to O(N).",
          "It eliminates the need for allocating extra space.",
          "It allows us to avoid checking for negative complements."
        ],
        correctAnswerIndex: 1
      },
      {
        question: "What complement value are we searching for if the target is 10 and the current element is 4?",
        options: [
          "14",
          "2.5",
          "6",
          "40"
        ],
        correctAnswerIndex: 2
      }
    ]
  },
  {
    id: "valid-parentheses",
    name: "Valid Parentheses",
    difficulty: "Easy",
    enrolled: false,
    description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    starterCode: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const bracketMap: Record<string, string> = {
    ')': '(',
    '}': '{',
    ']': '['
  };
  
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (['(', '{', '['].includes(char)) {
      stack.push(char);
    } else {
      const top = stack.pop();
      if (top !== bracketMap[char]) {
        return false;
      }
    }
  }
  
  return stack.length === 0;
}`,
    optimalComplexity: "Time: O(N) | Space: O(N)",
    testCases: [
      { input: "s = \"()\"", expected: "true" },
      { input: "s = \"()[]{}\"", expected: "true" },
      { input: "s = \"(]\"", expected: "false" }
    ],
    steps: [
      { line: 2, label: "Initialize Stack", action: "Create an empty array to serve as our Lifo Stack.", stateBefore: "s = \"([]\" | Stack = undefined", stateAfter: "Stack = []" },
      { line: 10, label: "Check char '('[idx 0]", action: "Character is an open paren. Push directly onto our LIFO stack.", stateBefore: "Stack = []", stateAfter: "Stack = ['(']" },
      { line: 10, label: "Check char '['[idx 1]", action: "Character is an open square bracket. Push onto our LIFO stack.", stateBefore: "Stack = ['(']", stateAfter: "Stack = ['(', '[']" },
      { line: 12, label: "Check char ']'[idx 2]", action: "Character is a closed bracket. Pop last item of stack and verify matches.", stateBefore: "Stack = ['(', '[']", stateAfter: "Stack = ['('] | Popped = '[' | Match expected = '[' | Valid = true" },
      { line: 20, label: "Loop Completes", action: "Array bounds exhausted. Check if stack is empty. We still have '(' in history.", stateBefore: "Stack = ['(']", stateAfter: "Stack = ['('] | length = 1 | Returns false (Unclosed parentheses!)" }
    ],
    teachingMaterials: {
      introduction: "Explore the LIFO (Last-In-First-Out) properties of stacks. We will validate brackets by pushing open brackets onto a stack and checking them against matching closed brackets.",
      keyConcepts: [
        "LIFO Ordering: The most recently opened bracket must be the first one closed.",
        "Stack Operations: Push open brackets; Pop when encountering closed brackets to check if they match.",
        "Boundary Cases: Ensure the stack is fully empty at the end, and we never pop from an empty stack!"
      ],
      videoPlaceholderText: "We visualize parsing brackets from left to right. Notice how the stack naturally accumulates pending brackets and pops them in reverse order. This is the foundation of parser grammar!"
    },
    quiz: [
      {
        question: "What happens if a closed bracket is processed but the stack is empty?",
        options: [
          "It is pushed onto the stack as a placeholder.",
          "The string is immediately invalid because there is no matching open bracket.",
          "We skip it and proceed to the next element.",
          "We wait for a matching open bracket to appear later."
        ],
        correctAnswerIndex: 1
      },
      {
        question: "At the end of parsing, what must be true for the input string to be valid?",
        options: [
          "The stack must have exactly 1 element.",
          "The stack must be completely empty.",
          "The stack must contain only open parentheses.",
          "The stack must be sorted alphabetically."
        ],
        correctAnswerIndex: 1
      }
    ]
  },
  {
    id: "binary-search",
    name: "Binary Search",
    difficulty: "Medium",
    enrolled: false,
    description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`.\n\nIf `target` exists, then return its index. Otherwise, return `-1`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
    starterCode: `function binarySearch(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) {
      return mid;
    }
    
    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}`,
    optimalComplexity: "Time: O(log N) | Space: O(1)",
    testCases: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", expected: "4" },
      { input: "nums = [-1,0,3,5,9,12], target = 2", expected: "-1" }
    ],
    steps: [
      { line: 2, label: "Set Boundaries", action: "Initialize left boundary to index 0, and right boundary to the last element.", stateBefore: "nums = [1,3,5,7,9] | target = 7", stateAfter: "left = 0 | right = 4" },
      { line: 6, label: "Calculate Mid [Loop 1]", action: "mid = Math.floor((0 + 4) / 2) = 2. nums[2] is 5.", stateBefore: "left = 0 | right = 4", stateAfter: "left = 0 | right = 4 | mid = 2 | nums[mid] = 5" },
      { line: 12, label: "Update Boundaries", action: "Since nums[mid] (5) is less than target (7), target must lie on the right. Move left to 3.", stateBefore: "mid = 2 | target = 7", stateAfter: "left = 3 | right = 4" },
      { line: 6, label: "Calculate Mid [Loop 2]", action: "mid = Math.floor((3 + 4) / 2) = 3. nums[3] is 7.", stateBefore: "left = 3 | right = 4", stateAfter: "left = 3 | right = 4 | mid = 3 | nums[mid] = 7" },
      { line: 8, label: "Target Matched!", action: "nums[mid] (7) matches target (7). Match found at index position 3.", stateBefore: "mid = 3 | target = 7", stateAfter: "Returns 3 | Search Completed" }
    ],
    teachingMaterials: {
      introduction: "Learn how to find elements in sorted arrays in O(log N) logarithmic time by continuously dividing the search interval in half. This is incredibly faster than linear search!",
      keyConcepts: [
        "Pre-condition: The collection must be sorted in ascending or descending order.",
        "Divide & Conquer: Calculate the mid index, then narrow down the left or right half based on comparison.",
        "Logarithmic Speed: Doubling the dataset only adds a single extra comparison step!"
      ],
      videoPlaceholderText: "Visualizing a classic number guessing game! If you search for a number between 1 and 100, guessing 50 immediately eliminates half the search space. We write this index arithmetic using left and right pointers."
    },
    quiz: [
      {
        question: "Why does Binary Search require the input array to be sorted?",
        options: [
          "Because unsorted arrays cannot be split in half.",
          "To make sure index coordinates remain even numbers.",
          "So that comparing the middle element can deterministically eliminate one half of the search space.",
          "To avoid triggering index memory exceptions."
        ],
        correctAnswerIndex: 2
      },
      {
        question: "If we search a sorted array of 1024 elements, what is the maximum number of steps Binary Search takes?",
        options: [
          "1024 steps",
          "512 steps",
          "10 steps",
          "1 step"
        ],
        correctAnswerIndex: 2
      }
    ]
  },
  {
    id: "merge-sort",
    name: "Merge Sort",
    difficulty: "Hard",
    enrolled: false,
    description: "Sort an array using the divide-and-conquer strategy. Recursively split the array in half, sort the sub-arrays, and merge them back together in linear time.",
    starterCode: `function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let l = 0, r = 0;
  while (l < left.length && r < right.length) {
    if (left[l] < right[r]) result.push(left[l++]);
    else result.push(right[r++]);
  }
  return [...result, ...left.slice(l), ...right.slice(r)];
}`,
    optimalComplexity: "Time: O(N log N) | Space: O(N)",
    testCases: [
      { input: "arr = [38, 27, 43, 3]", expected: "[3, 27, 38, 43]" },
      { input: "arr = [9, 8, 5]", expected: "[5, 8, 9]" }
    ],
    steps: [
      { line: 2, label: "Base Case Check", action: "Check if array has length 1 or 0 (it is already sorted).", stateBefore: "arr = [38, 27]", stateAfter: "sorted = false" },
      { line: 4, label: "Calculate Mid", action: "Calculate mid index to partition array. mid = Math.floor(2 / 2) = 1.", stateBefore: "arr = [38, 27]", stateAfter: "mid = 1 | leftSlice = [38] | rightSlice = [27]" },
      { line: 8, label: "Merge Subproblems", action: "Combine single sorted slices [38] and [27] back into sorted array.", stateBefore: "left = [38] | right = [27]", stateAfter: "merged = [27, 38]" }
    ],
    teachingMaterials: {
      introduction: "Dive deep into recursive sorting. Merge Sort splits arrays down to single elements and merges them back in sorted order with stable O(N log N) time complexity.",
      keyConcepts: [
        "Divide & Conquer: Breaking down a large unsorted array into individual single-element subproblems recursively.",
        "Merge Heuristic: Using index pointers to join two sorted sub-arrays into a single fully sorted output array.",
        "Space Overhead: Unlike Quick Sort, standard Merge Sort is not in-place and requires O(N) auxiliary memory space."
      ],
      videoPlaceholderText: "Watch the beautiful recursion tree unfold. We continuously partition the array until we reach single elements. Then, we merge them back up, element by element, sorting them as we go."
    },
    quiz: [
      {
        question: "What is the worst-case and average-case time complexity of Merge Sort?",
        options: [
          "O(N)",
          "O(N log N)",
          "O(N²)",
          "O(log N)"
        ],
        correctAnswerIndex: 1
      },
      {
        question: "What is a major disadvantage of Merge Sort compared to algorithms like Quick Sort or Heap Sort?",
        options: [
          "It is extremely slow on small datasets.",
          "It requires extra memory space of O(N) to store temporary arrays.",
          "It cannot handle duplicates in the inputs.",
          "It is not stable when sorting integers."
        ],
        correctAnswerIndex: 1
      }
    ]
  },
  {
    id: "fibonacci-sequence",
    name: "Fibonacci & Dynamic Programming",
    difficulty: "Medium",
    enrolled: false,
    description: "Compute the N-th Fibonacci number efficiently. Standard recursive calculations take O(2^N) exponential time, but we can use Memoization or Bottom-Up Dynamic Programming to solve it in linear time O(N)!",
    starterCode: `function fib(n: number): number {
  if (n <= 1) return n;
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
  }
  return dp[n];
}`,
    optimalComplexity: "Time: O(N) | Space: O(1)",
    testCases: [
      { input: "n = 6", expected: "8" },
      { input: "n = 10", expected: "55" }
    ],
    steps: [
      { line: 2, label: "Check Base Case", action: "Check if n is 0 or 1. For n = 6, skip base case.", stateBefore: "n = 6", stateAfter: "dp = undefined" },
      { line: 3, label: "Set Base dp Ledger", action: "Establish starting sequence values: F(0)=0 and F(1)=1 in our array.", stateBefore: "n = 6", stateAfter: "dp = [0, 1]" },
      { line: 4, label: "Iterate to target", action: "Construct Fibonacci numbers sequentially. For index 2: dp[2] = dp[1] + dp[0] = 1.", stateBefore: "dp = [0, 1]", stateAfter: "dp = [0, 1, 1] | i = 2" }
    ],
    teachingMaterials: {
      introduction: "Learn the power of Dynamic Programming (DP) by storing the results of subproblems. Avoid redundant calculations and speed up computation exponentially!",
      keyConcepts: [
        "Memoization (Top-Down): Caching recursion results inside a table so we never calculate the exact same branch twice.",
        "Tabulation (Bottom-Up): Building results sequentially inside a flat array from left to right.",
        "Space Optimization: Recognizing we only ever need the last two values (F[n-1] and F[n-2]) to compute F[n], saving memory."
      ],
      videoPlaceholderText: "Drawing the massive recursion tree of F(5). Look at how many times F(2) and F(3) are computed! We replace this wasteful duplication by storing calculated values in a simple table."
    },
    quiz: [
      {
        question: "Why is naive recursive Fibonacci (without caching) considered extremely inefficient?",
        options: [
          "It causes floating-point precision errors.",
          "It recalculates the exact same subproblems multiple times, resulting in exponential time.",
          "It exceeds standard integer index boundaries.",
          "It runs slower than O(N³) algorithms."
        ],
        correctAnswerIndex: 1
      },
      {
        question: "How can we optimize the space complexity of bottom-up Fibonacci to O(1) auxiliary memory?",
        options: [
          "By using a hash map instead of an array.",
          "By discarding the recursion stack entirely.",
          "By storing only the previous two computed values in two helper variables.",
          "By pre-calculating all integers up to infinity."
        ],
        correctAnswerIndex: 2
      }
    ]
  }
];

export const OLLAMA_MODELS: DownloadableModel[] = [
  {
    id: "gemma-2",
    name: "gemma2:2b",
    size: "1.6 GB",
    description: "Google's lightweight, open-weight model tuned for conversational task precision and in-browser efficiency.",
    downloaded: false,
    downloadProgress: 0,
  },
  {
    id: "qwen-2-0.5",
    name: "qwen2:0.5b",
    size: "394 MB",
    description: "An incredibly compact, extremely memory-efficient SLM optimized for immediate execution on low-spec systems.",
    downloaded: true,
    downloadProgress: 100,
    compilingPhase: "Cached",
  },
  {
    id: "qwen-2-1.5",
    name: "qwen2:1.5b",
    size: "924 MB",
    description: "Balanced parameters and memory footprint. Excellent for writing logical blocks and processing local prompts.",
    downloaded: false,
    downloadProgress: 0,
  },
  {
    id: "phi-3",
    name: "phi3:3.8b",
    size: "2.2 GB",
    description: "Microsoft's high-capability small language model, boasting heavy multi-step logic and instruction tracking.",
    downloaded: false,
    downloadProgress: 0,
  },
  {
    id: "llama-3-8b",
    name: "llama3:8b",
    size: "4.7 GB",
    description: "Meta's flagship open LLM, optimized for general-purpose reasoning. Suitable for workstation-grade hardware with WebGPU.",
    downloaded: false,
    downloadProgress: 0,
  }
];
