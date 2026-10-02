/**
 * Mock Data for StudyLM Phase 02 UI/UX
 */

export const MOCK_USER = {
  name: 'Daksh',
  fullName: 'Daksh Sharma',
  email: 'daksh@studylm.edu',
  role: 'Computer Science Researcher & Student',
  institution: 'Department of Computer Science',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  joinedDate: 'September 2026',
  stats: {
    notebooksCount: 6,
    sourcesCount: 28,
    questionsAsked: 142,
    studyHours: 34.5,
    storageUsedMB: 84.2,
    storageLimitMB: 500,
  },
};

export const MOCK_NOTEBOOKS = [
  {
    id: 'cn-unit-1',
    title: 'Computer Networks',
    description: 'OSI 7-layer architecture, TCP/IP protocol suite, subnetting, congestion control algorithms, and socket programming.',
    category: 'Core CS',
    icon: 'Network',
    color: '#1F5E4B',
    accentColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    sourceCount: 5,
    lastUpdated: '10 mins ago',
    updatedAt: '2026-10-02T04:30:00.000Z',
    isFavorite: true,
    sources: [
      {
        id: 's-1',
        title: 'Kurose_Ross_Computer_Networking_Ch1-4.pdf',
        type: 'pdf',
        size: '14.2 MB',
        pages: 142,
        status: 'ready',
        uploadedAt: 'Yesterday',
        snippet: 'Comprehensive analysis of application, transport, network, and data link layers.',
      },
      {
        id: 's-2',
        title: 'TCP_Congestion_Control_RFC5681.docx',
        type: 'docx',
        size: '2.8 MB',
        pages: 24,
        status: 'ready',
        uploadedAt: '2 days ago',
        snippet: 'Slow start, congestion avoidance, fast retransmit, and fast recovery algorithms.',
      },
      {
        id: 's-3',
        title: 'https://www.ietf.org/rfc/rfc793.txt',
        type: 'web',
        size: '184 KB',
        status: 'ready',
        uploadedAt: '3 days ago',
        snippet: 'Transmission Control Protocol DARPA Internet Program Protocol Specification.',
      },
      {
        id: 's-4',
        title: 'Socket_Programming_Lab_Notes.txt',
        type: 'txt',
        size: '95 KB',
        status: 'ready',
        uploadedAt: '5 days ago',
        snippet: 'C socket implementation for TCP client-server echo and multi-thread handling.',
      },
      {
        id: 's-5',
        title: 'BGP_Routing_Security_Draft.pdf',
        type: 'pdf',
        size: '5.1 MB',
        pages: 38,
        status: 'processing',
        uploadedAt: 'Just now',
        snippet: 'Autonomous system path vector routing and RPKI validation.',
      },
    ],
  },
  {
    id: 'dsa-advanced',
    title: 'Data Structures & Algorithms',
    description: 'Self-balancing AVL trees, Red-Black trees, graph traversal (Dijkstra, Bellman-Ford), and dynamic programming paradigms.',
    category: 'Algorithms',
    icon: 'Binary',
    color: '#2B5A84',
    accentColor: 'bg-sky-50 text-sky-800 border-sky-200',
    sourceCount: 7,
    lastUpdated: '2 hours ago',
    updatedAt: '2026-10-02T02:00:00.000Z',
    isFavorite: true,
    sources: [
      {
        id: 's-201',
        title: 'CLRS_Algorithms_Graphs_Trees.pdf',
        type: 'pdf',
        size: '28.5 MB',
        pages: 320,
        status: 'ready',
        uploadedAt: 'Oct 01, 2026',
        snippet: 'Graph algorithms, minimum spanning trees, and maximum flow theory.',
      },
      {
        id: 's-202',
        title: 'Dynamic_Programming_Mastery.docx',
        type: 'docx',
        size: '4.1 MB',
        pages: 45,
        status: 'ready',
        uploadedAt: 'Sep 29, 2026',
        snippet: 'Optimal substructure and overlapping subproblems with memoization.',
      },
      {
        id: 's-203',
        title: 'https://cp-algorithms.com/graph/dijkstra.html',
        type: 'web',
        size: '240 KB',
        status: 'ready',
        uploadedAt: 'Sep 28, 2026',
        snippet: 'Shortest path algorithms and sparse graph optimizations using priority queues.',
      },
    ],
  },
  {
    id: 'dbms-internals',
    title: 'Database Management Systems',
    description: 'Relational algebra, B+ Tree indexing mechanisms, ACID transaction concurrency control, and WAL recovery systems.',
    category: 'Systems',
    icon: 'Database',
    color: '#8A4F1D',
    accentColor: 'bg-amber-50 text-amber-900 border-amber-200',
    sourceCount: 4,
    lastUpdated: 'Yesterday',
    updatedAt: '2026-10-01T14:20:00.000Z',
    isFavorite: false,
    sources: [
      {
        id: 's-301',
        title: 'Ramakrishnan_DBMS_Storage_Indexing.pdf',
        type: 'pdf',
        size: '18.4 MB',
        pages: 180,
        status: 'ready',
        uploadedAt: 'Sep 27, 2026',
        snippet: 'Buffer management, page layouts, and B+ tree index concurrency.',
      },
    ],
  },
  {
    id: 'ai-foundations',
    title: 'Artificial Intelligence & LLMs',
    description: 'Transformer architectures, self-attention mechanics, Retrieval-Augmented Generation (RAG), and vector embeddings.',
    category: 'AI / ML',
    icon: 'Sparkles',
    color: '#1F5E4B',
    accentColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    sourceCount: 6,
    lastUpdated: '3 days ago',
    updatedAt: '2026-09-29T18:00:00.000Z',
    isFavorite: true,
    sources: [
      {
        id: 's-401',
        title: 'Attention_Is_All_You_Need.pdf',
        type: 'pdf',
        size: '2.1 MB',
        pages: 15,
        status: 'ready',
        uploadedAt: 'Sep 25, 2026',
        snippet: 'Foundational paper introducing the multi-head self-attention transformer model.',
      },
      {
        id: 's-402',
        title: 'RAG_Survey_and_Evaluation_Methods.pdf',
        type: 'pdf',
        size: '6.7 MB',
        pages: 42,
        status: 'ready',
        uploadedAt: 'Sep 26, 2026',
        snippet: 'Comprehensive analysis of naive, advanced, and modular RAG architectures.',
      },
    ],
  },
  {
    id: 'os-concurrency',
    title: 'Operating Systems & Kernel Design',
    description: 'Process scheduling, virtual memory paging, semaphore synchronization, deadlock detection, and file system layout.',
    category: 'Systems',
    icon: 'Cpu',
    color: '#4B3F72',
    accentColor: 'bg-purple-50 text-purple-900 border-purple-200',
    sourceCount: 3,
    lastUpdated: '5 days ago',
    updatedAt: '2026-09-27T09:15:00.000Z',
    isFavorite: false,
    sources: [
      {
        id: 's-501',
        title: 'Silberschatz_OS_Concepts_Ch5-9.pdf',
        type: 'pdf',
        size: '22.1 MB',
        pages: 210,
        status: 'ready',
        uploadedAt: 'Sep 20, 2026',
        snippet: 'CPU scheduling algorithms and virtual memory page replacement techniques.',
      },
    ],
  },
  {
    id: 'stats-ml',
    title: 'Probability & Statistical Inference',
    description: 'Bayes theorem, Gaussian distributions, maximum likelihood estimation (MLE), and hypothesis testing.',
    category: 'Mathematics',
    icon: 'Sigma',
    color: '#5C6B73',
    accentColor: 'bg-slate-50 text-slate-800 border-slate-200',
    sourceCount: 3,
    lastUpdated: '1 week ago',
    updatedAt: '2026-09-24T11:00:00.000Z',
    isFavorite: false,
    sources: [
      {
        id: 's-601',
        title: 'Bishop_PRML_Chapter1_2.pdf',
        type: 'pdf',
        size: '12.8 MB',
        pages: 110,
        status: 'ready',
        uploadedAt: 'Sep 18, 2026',
        snippet: 'Probability distributions, decision theory, and information theory basics.',
      },
    ],
  },
];

export const MOCK_CHAT_CONVERSATION = [
  {
    id: 'msg-1',
    sender: 'user',
    text: 'How does the OSI 7-layer model compare to the TCP/IP 4-layer architecture based on our uploaded notes?',
    timestamp: '10:42 AM',
  },
  {
    id: 'msg-2',
    sender: 'ai',
    text: `Based on **Kurose & Ross (Ch. 1)** and your **Unit 1 lecture notes**, the **OSI model** and the **TCP/IP model** share the fundamental goal of layered network abstraction, but they differ significantly in conceptual granularity and practical implementation:

### 1. Architectural Granularity
* **OSI 7-Layer Model**: A strict theoretical standard defining **Application (7), Presentation (6), Session (5), Transport (4), Network (3), Data Link (2), and Physical (1)**.
* **TCP/IP 4-Layer Model**: A pragmatic, protocol-driven model that condenses OSI layers 5–7 into a single **Application Layer**, followed by **Transport**, **Internet (Network)**, and **Network Interface (Link/Physical)**.

### 2. Functional Differences in Upper Layers
The Session and Presentation layers in OSI handle data syntax translation, encryption/decryption, and dialog management. In TCP/IP, these responsibilities are delegated entirely to the application protocols (e.g., TLS handles encryption directly within Application/Transport interfaces).

### 3. Connection Orientation
* OSI explicitly supports both connectionless and connection-oriented communication at both the Network and Transport layers.
* TCP/IP emphasizes a **connectionless Network layer (IP)** with optional connection-oriented reliability handled strictly at the **Transport layer (TCP)**.`,
    timestamp: '10:43 AM',
    citations: [
      {
        id: 'c-1',
        sourceTitle: 'Kurose_Ross_Computer_Networking_Ch1-4.pdf',
        page: 12,
        snippet: 'The Internet protocol stack comprises five layers: application, transport, network, link, and physical. In contrast, the OSI 7-layer model includes session and presentation layers.',
      },
      {
        id: 'c-2',
        sourceTitle: 'TCP_Congestion_Control_RFC5681.docx',
        page: 4,
        snippet: 'TCP provides reliable end-to-end byte stream delivery over an inherently best-effort, packet-switched Internet Protocol layer.',
      },
    ],
  },
  {
    id: 'msg-3',
    sender: 'user',
    text: 'What are the exact triggers for TCP Fast Retransmit according to RFC 5681?',
    timestamp: '10:45 AM',
  },
  {
    id: 'msg-4',
    sender: 'ai',
    text: `According to **RFC 5681 (Section 3.2)** in your source materials, **TCP Fast Retransmit** is triggered when a sender receives **three duplicate ACKs** (i.e., four identical ACKs without any intervening progress).

### Key Mechanics:
1. **Duplicate ACK Generation**: When an out-of-order segment arrives at the receiver, TCP generates an immediate duplicate ACK indicating the expected sequence number.
2. **The 3-DupACK Threshold**: A single or double duplicate ACK can simply be caused by packet reordering in the network. A sequence of 3 duplicate ACKs strongly implies that the missing packet was dropped rather than delayed.
3. **Action Taken**: Upon reaching the 3rd duplicate ACK, the sender immediately retransmits the missing segment without waiting for the **Retransmission Timeout (RTO)** timer to expire, significantly reducing transfer latency.`,
    timestamp: '10:46 AM',
    citations: [
      {
        id: 'c-3',
        sourceTitle: 'TCP_Congestion_Control_RFC5681.docx',
        page: 18,
        snippet: 'The TCP sender should use the fast retransmit algorithm to detect and repair loss based on the arrival of three duplicate ACKs.',
      },
    ],
  },
];

export const MOCK_STUDY_TOOLS = {
  summary: {
    title: 'Executive Study Summary',
    content: `**Computer Networks Core Summary (Unit 1 & 2):**
• **Protocol Stack Hierarchy**: Layered architecture enables modular design. TCP guarantees ordered byte-stream delivery with congestion mitigation, while UDP provides low-latency datagram delivery.
• **Congestion Control**: Governed by 4 key algorithms: Slow Start (exponential window growth until *ssthresh*), Congestion Avoidance (linear AIMD increase), Fast Retransmit (loss detection via 3 duplicate ACKs), and Fast Recovery.
• **Subnetting & Addressing**: IPv4 utilizes classless inter-domain routing (CIDR) with variable length subnet masking (VLSM) to minimize address exhaustion.`,
  },
  notes: [
    { id: 'n-1', title: 'OSI vs TCP/IP Comparison Cheat Sheet', date: 'Oct 01' },
    { id: 'n-2', title: 'TCP Congestion State Machine Diagram', date: 'Sep 29' },
    { id: 'n-3', title: 'Subnet Mask Calculation Shortcuts', date: 'Sep 28' },
  ],
  quiz: [
    {
      id: 'q-1',
      question: 'How many duplicate ACKs must a TCP sender receive before triggering Fast Retransmit?',
      options: ['1 duplicate ACK', '2 duplicate ACKs', '3 duplicate ACKs', '4 duplicate ACKs'],
      correctIndex: 2,
      explanation: 'RFC 5681 mandates exactly 3 duplicate ACKs (4 total identical ACKs) to distinguish packet loss from reordering.',
    },
    {
      id: 'q-2',
      question: 'Which OSI layer is responsible for data encryption, compression, and syntax conversion?',
      options: ['Session Layer (5)', 'Presentation Layer (6)', 'Application Layer (7)', 'Transport Layer (4)'],
      correctIndex: 1,
      explanation: 'The Presentation Layer (Layer 6) handles syntax formatting, character encoding, and cryptographic encryption.',
    },
    {
      id: 'q-3',
      question: 'In TCP Congestion Avoidance phase, how is the congestion window (cwnd) adjusted per RTT?',
      options: ['Doubled every RTT', 'Increased by 1 MSS per RTT (Additive Increase)', 'Halved every RTT', 'Remains constant'],
      correctIndex: 1,
      explanation: 'Additive Increase Multiplicative Decrease (AIMD) dictates cwnd increases by approximately 1 MSS per RTT in congestion avoidance.',
    },
  ],
  flashcards: [
    {
      id: 'fc-1',
      front: 'What is the primary function of the TCP Three-Way Handshake?',
      back: 'To establish a reliable connection between client and server, synchronize initial sequence numbers (ISN), and agree on maximum segment size (MSS) parameters.',
    },
    {
      id: 'fc-2',
      front: 'Define AIMD in the context of TCP Congestion Control.',
      back: 'Additive Increase Multiplicative Decrease: a feedback control algorithm that linearly increases congestion window when no loss is detected and halves it when loss occurs.',
    },
    {
      id: 'fc-3',
      front: 'What is the maximum theoretical throughput of a Stop-and-Wait ARQ protocol?',
      back: 'Throughput = Frame Size / (Frame Transmission Time + 2 × Propagation Delay). Highly inefficient on high bandwidth-delay product links.',
    },
    {
      id: 'fc-4',
      front: 'What distinguishes RPKI in BGP routing security?',
      back: 'Resource Public Key Infrastructure (RPKI) cryptographically binds IP address blocks and Autonomous System Numbers (ASNs) via Route Origin Authorizations (ROAs) to prevent route hijacking.',
    },
  ],
  keyPoints: [
    'Layered abstraction prevents cross-protocol tight coupling.',
    'TCP handles flow control via Receive Window (rwnd) and congestion via Congestion Window (cwnd).',
    '3-duplicate ACKs trigger Fast Retransmit & Fast Recovery, avoiding costly RTO timeouts.',
    'CIDR notation `/24` represents 24 network bits and 8 host bits (254 usable hosts).',
    'DNS operates primarily over UDP port 53 for speed, falling back to TCP for zone transfers and large records.',
  ],
};
