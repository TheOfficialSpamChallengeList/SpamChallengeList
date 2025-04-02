import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        
        </main>
    `,
};
