
// A simple event-based performance tracker for client-side monitoring.

type PerfEvent = {
    reads: number;
    writes: number;
};

const listeners: ((event: PerfEvent) => void)[] = [];

let sessionReads = 0;
let sessionWrites = 0;

export const perfTracker = {
    increment: (event: PerfEvent) => {
        sessionReads += event.reads;
        sessionWrites += event.writes;
        listeners.forEach(listener => listener({ reads: sessionReads, writes: sessionWrites }));
    },
    
    subscribe: (listener: (event: PerfEvent) => void): (() => void) => {
        listeners.push(listener);
        // Immediately notify the new listener with the current counts
        listener({ reads: sessionReads, writes: sessionWrites });
        
        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    },

    getCounts: (): PerfEvent => ({
        reads: sessionReads,
        writes: sessionWrites,
    }),
};
