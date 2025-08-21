import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 100" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">FPS</div>
                            <p>{{ level.fps || 'Any' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 100"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else-if="selected +1 <= 100"><strong>100%</strong> or better to qualify</p>
                    <p v-else>This level does not accept new records.</p>
                    <p><strong>Handcam is {{['not needed', 'recommended', 'necessary'][level.handcam]}} for this level.</strong></p>
                    <p><strong>Device: {{level.device}}.</strong></p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                             <td class="nuc">
                                <img v-if="record.nuc" :src="\`/assets/mf.svg\`" alt="mf">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>The stupid fucking devs made a problem, alert them</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a></p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>List Requirements</h3>
                    <p>
                        The difficulty must be almost all in the spam of the level. You are allowed to put a triple spike or a timing at the end or beginning.
                    </p>
                    <p>
                        You are not allowed to use methods of spamming that require little effort for very high amounts of cps, such as drag clicking, bolt clicking.
                    </p>
                    <p>
                        The lowest respawn time is 0.5 seconds.
                    </p>
                    <p>
                        A maximum of 2 inputs are allowed when spamming.
                    </p>
                    <p>
                        All hardware is able to be used, though it is level specific. For example, you can use logitech g512 to beat pepino. Though for a level like Why The Spam, you have to use a near capless device (15ms debounce or less). A list of hardware and its appropriate debounce time will most likely develop over time. Levels beaten with capped devices will be placed according to how hard it was on the capped device. If a level is beaten with a device with a lower debounce delay, the level will be verified with that device as long as the difference is greater than a 5ms debounce delay. This also means the device with a higher debounce delay will not be allowed in completions anymore. An example would be beating garbanzo on k55 then later it gets beaten on sayo device, garbanzo will be ranked according to how hard it is on sayo device and will no longer be allowed to be beaten on k55.
                    </p>
                    <p>
                        All devices that are considered capped are the K55, K65 mini, k70, DeathStalker v2, BlackWidow v3, g502, g512, g203, Finalmouse Ultralight 2.
                    </p>
                    <p>
                        Because of the changes to fps in 2.2, physics bypass is ONLY ALLOWED for values under 240. For levels already on the list you may beat them in 2.1 (you can use 59-360fps). Click between frames is allowed as long as you state that you used it since it is counted as its own fps value. This means that you can only beat levels with CBF that were verified with CBF or with levels verified with 240 and over.
                    </p>
                    <p>
                        Rebinding keys IS allowed as long as you use only 2 or less keys!
                    </p>
                    <p>
                         It may say Spam "Challenge" List, however there is not really a time limit.
                    </p>
                    <p>
                         Only fifteen 60fps 15cps straight spam levels can be on the top 100 list at once. This rule only applies for levels done with alternating, so ways such as jitter don't get affected by this.
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
