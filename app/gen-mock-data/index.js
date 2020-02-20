const fs = require('fs');
const chalk = require('chalk').default;
const TVDB = require('node-tvdb');
const { map, forEach } = require('p-iteration');
const AppError = require('../errors/app-error');
const helpers = require('../helpers');
const countries = require('./countries');

const genMockData = async db => {
    if (!db) {
        throw new AppError({
            message: 'Missing db param!'
        });
    }

    const log = helpers.log.child({
        src: 'genMockData',
        title: 'Generating mock data!',
        level: 'DEBUG'
    });

    if (!process.env.NODE_ENV) {
        log.debug('Skipping as no NODE_ENV is set.')
        log.close();
        return;
    }

    const dataToGen = {
        addPerson: true,
        personAndMovie: true,
        personShowAndEpisode: true,
        videoGame: true,
        addCountry: true,
        addOccupations: true
    };

    log.debug('Generating mock data...');

    /**
     * Returns UTC timestamp.
     * 
     * @param {Object} opts
     * @param {number} opts.year
     * @param {number} opts.month
     * @param {number} opts.date
     * @param {string} [opts.timezone = '']
     */
    const createTimestamp = ({
        year,
        month,
        date,
        timezone = ''
    }) => new Date(year, month, date).toISOString();

    /**
     * Find or create thing and return ID.
     * @param {string} collection Collection to use.
     * @param {object} searchCriteria e.g. `{ _id: 'eee2051f-bd0a-4dfe-bbdd-3578a57ef1bc' }`
     * @param {object} [updateData = {}] e.g. `{ additionalName: 'John' }`
     */
    const findOrCreate = async (collection, searchCriteria, updateData = {}) => {
        const log = helpers.log.child({
            src: 'findOrCreate',
            title: `Looking for ${JSON.stringify(searchCriteria)}`,
            level: 'DEBUG'
        });

        // Find things based on searchCriteria
        const foundThings = await db.find(collection, {
            ...searchCriteria
        });

        if (foundThings.length > 1) {
            throw new AppError({
                message: 'Found multiple things for that query!',
                data: {
                    things: foundThings
                }
            });
        }

        const foundThing = foundThings[0];

        // If we found an existing one return ID.
        if (foundThing) {
            log.debug('findOrCreate', `Returning ${chalk.green('EXISTING')} ${foundThing._id} from ${collection}`, {
                attach: foundThing
            });
            return foundThing;
        }

        // Create a new thing
        const newThing = await db.create(collection, {
            ...searchCriteria,
            ...updateData
        }).catch(error => {
            log.error('findOrCreate', error.message, {
                attach: error
            });
            log.close();
        });

        log.debug('findOrCreate', `Returning ${chalk.yellow('NEW')} ${newThing._id} from ${collection}`, {
            attach: newThing
        });
        log.close();

        return newThing;
    };

    const findOrCreateAndReturnId = (people, type) => map(people, person => {
        log.debug(`Adding ${type} ${typeof person === 'string' ? person : (person.givenName + ' ' + person.familyName)}`);

        return findOrCreate('people', {
            '@type': 'Person',
            ...person
        }).then(item => item._id);
    });

    const updateRelationship = async (person, people, field, relationship) => {
        await forEach(people, async _id => {
            const other = await db.findOne('people', { id });

            log.debug(`Updating ${relationship} ${other.givenName} adding ${person.givenName} as ${field}`);
            await db.update('people', other._id, {
                ...other,
                [field]: [
                    ...(Object.keys(other).includes(field) ? other[field] : []),
                    person._id
                ]
            });
        });
    };

    /**
     * @typedef Place
     * @type object
     *
     * @property {string} name
     */

    /**
     * @typedef Person
     * @type object
     * 
     * @property {string} familyName The person's family name.
     * @property {string} givenName The person's given name.
     * @property {string} [additionalName] Can be used for a middle name.
     * @property {string[] | Person[]} [parents=[]] The person's parents.
     * @property {string[] | Person[]} [children=[]] The person's children.
     * @property {string[] | Person[]} [spouses=[]] The person's spouses.
     * @property {string[] | Person[]} [siblings=[]] The person's siblings.
     * @property {string} [birthDate = ''] The person's date of birth in UTC format.
     * @property {Place} [nationality] The person's place of birth.
     */

    /**
     * Add a person to the DB.
     * 
     * @param {Person} person
     */
    const addPerson = async ({
        familyName,
        givenName,
        additionalName,
        parents = [],
        children = [],
        spouses = [],
        siblings = [],
        nationality,
        birthDate
    }) => {
        const haveParents = parents.length >= 1;
        const haveChildren = children.length >= 1;
        log.debug(`Adding user ${givenName} ${familyName}${(haveParents || haveChildren) ? ' with ' : ''}${haveParents ? 'parents' : ''}${(haveParents && haveChildren) ? ' and ' : ''}${haveChildren ? 'children' : ''}`);

        // Resolve all objects to ID strings
        parents = await findOrCreateAndReturnId(parents, 'parent');
        children = await findOrCreateAndReturnId(children, 'child');
        spouses = await findOrCreateAndReturnId(spouses, 'spouse');
        siblings = await findOrCreateAndReturnId(siblings, 'sibling');

        // Resolve object to ID string
        if (nationality) {
            nationality = await findOrCreate('countries', {
                '@type': 'Country',
                name: typeof nationality === 'string' ? nationality : (nationality && nationality.name)
            }).then(item => item._id);
        }

        // Search for person via familyName, additionalName and givenName.
        // When found update rest of details.
        const person = await findOrCreate('people', {
            '@type': 'Person',
            familyName,
            givenName
        }, {
            ...additionalName && { additionalName },
            birthDate,
            parents,
            children,
            spouses,
            siblings,
            nationality
        });

        // Update the other end of the relationship
        await updateRelationship(person, parents, 'children', 'parent');
        await updateRelationship(person, children, 'parents', 'child');
        await updateRelationship(person, spouses, 'spouses', 'spouse');
        await updateRelationship(person, siblings, 'siblings', 'sibling');

        return person;
    };

    // Occupations
    if (dataToGen.addOccupations) {
        const occupations = [{
            name: 'Actor'
        }, {
            name: 'Barista'
        }, {
            name: 'Chef'
        }, {
            name: 'Drug dealer'
        }, {
            name: 'Programmer'
        }];

        await forEach(occupations, async occupation => {
            await findOrCreate('occupations', {
                '@type': 'Occupation',
                name: occupation.name
            }, {
                ...occupation
            });
        });
    }

    // Countries
    if (dataToGen.addCountry) {
        await forEach(countries, async country => {
            await findOrCreate('countries', {
                '@type': 'Country',
                name: country.name
            }, {
                ...country
            });
        });
    }

    // People
    if (dataToGen.addPerson) {
        await addPerson({
            familyName: 'Tyler',
            givenName: 'Alexis',
            // gender: 'Female',
            nationality: {
                name: 'Australia'
            },
            birthDate: createTimestamp({
                year: 1996,
                month: 2,
                date: 10
            }),
            parents: [{
                familyName: 'Bridger',
                givenName: 'Lisa',
                birthDate: createTimestamp({
                    year: 1972,
                    month: 4,
                    date: 11
                })
            }, {
                familyName: 'Biar',
                givenName: 'Nicholas'
            }],
            siblings: [{
                familyName: 'Bridger',
                givenName: 'Michael',
                birthDate: createTimestamp({
                    year: 2001,
                    month: 1,
                    date: 31
                })
            }, {
                familyName: 'Bridger',
                givenName: 'Danual',
                birthDate: createTimestamp({
                    year: 1998,
                    month: 6,
                    date: 6
                })
            }, {
                familyName: 'Bridger',
                givenName: 'Phoenix'
            }, {
                familyName: 'Bridger',
                givenName: 'Chase'
            }, {
                familyName: 'Bridger',
                givenName: 'Hayley',
            }]
        });

        await addPerson({
            familyName: 'Bridger',
            givenName: 'Lisa',
            birthDate: createTimestamp({
                year: 1972,
                month: 4,
                date: 11
            }),
            spouses: [{
                familyName: 'Biar',
                givenName: 'Nicholas'
            }, {
                familyName: 'English',
                givenName: 'Mark'
            }, {
                familyName: 'Fry',
                additionalName: 'Lesley',
                givenName: 'Edward'
            }],
            children: [{
                familyName: 'Tyler',
                givenName: 'Alexis',
                birthDate: createTimestamp({
                    year: 1996,
                    month: 2,
                    date: 10
                })
            }, {
                familyName: 'Bridger',
                givenName: 'Michael',
                birthDate: createTimestamp({
                    year: 2001,
                    month: 1,
                    date: 31
                })
            }, {
                familyName: 'Bridger',
                givenName: 'Danual',
                birthDate: createTimestamp({
                    year: 1998,
                    month: 6,
                    date: 6
                })
            }, {
                familyName: 'Bridger',
                givenName: 'Phoenix'
            }, {
                familyName: 'Bridger',
                givenName: 'Chase'
            }, {
                familyName: 'Bridger',
                givenName: 'Hayley',
            }],
            parents: [{
                familyName: 'Grey',
                givenName: 'Frea'
            }, {
                familyName: 'Bridger',
                givenName: 'Alan'
            }],
            siblings: [{
                familyName: 'Bridger',
                givenName: 'Karl'
            }]
        });

        await addPerson({
            familyName: 'Biar',
            givenName: 'Nicholas',
            parents: [{
                familyName: 'Bleesing',
                givenName: 'Meridith'
            }, {
                familyName: 'Biar',
                givenName: 'Collin'
            }],
            children: [{
                familyName: 'Biar',
                givenName: 'Luke'
            }]
        });

        await addPerson({
            familyName: 'English',
            givenName: 'Mark',
            children: [{
                familyName: 'English',
                givenName: 'Lisa'
            }, {
                familyName: 'English',
                givenName: 'Rachael'
            }, {
                familyName: 'English',
                givenName: 'Anthony'
            }],
            parents: [{
                familyName: 'Mcleod',
                givenName: 'Dave'
            }, {
                familyName: 'English',
                givenName: 'Anne'
            }]
        });

        await addPerson({
            familyName: 'English',
            givenName: 'Lisa',
            spouses: [{
                familyName: 'Ingram',
                givenName: 'Daniel'
            }],
            children: [{
                familyName: 'Ingram',
                givenName: 'Taylah'
            }, {
                familyName: 'Ingram',
                givenName: 'Nikiata'
            }]
        });

        await addPerson({
            familyName: 'English',
            givenName: 'Rachael',
            spouses: [{
                familyName: 'Harrington',
                givenName: 'Jordan'
            }],
            children: [{
                familyName: 'Harrington',
                givenName: 'Noah'
            }, {
                familyName: 'Harrington',
                givenName: 'Koby'
            }]
        });

        await addPerson({
            familyName: 'White',
            givenName: 'Lesley',
            children: [{
                familyName: 'White',
                givenName: 'Ethan'
            }, {
                familyName: 'White',
                givenName: 'Teagan'
            }, {
                familyName: 'White',
                givenName: 'Ryan'
            }]
        });

        await addPerson({
            familyName: 'Sporn',
            givenName: 'Melony',
            children: [{
                familyName: 'Sporn',
                givenName: 'Taylah'
            }]
        });

        await addPerson({
            familyName: 'Fry',
            additionalName: 'Lesley',
            givenName: 'Edward',
            siblings: [{
                familyName: 'Fry',
                givenName: 'Tony'
            }, {
                familyName: 'Fry',
                givenName: 'Kym'
            }],
            children: [{
                familyName: 'Sporn',
                givenName: 'Taylah'
            }]
        });

        await addPerson({
            familyName: 'Boddey',
            givenName: 'Steven',
            spouses: [{
                familyName: 'Bridger',
                givenName: 'Lisa'
            }],
            children: [{
                familyName: 'Boddey',
                givenName: 'Tarly'
            }, {
                familyName: 'Boddey',
                givenName: 'Vicky'
            }, {
                familyName: 'Bridger',
                givenName: 'Michael'
            }]
        });

        await addPerson({
            familyName: 'Andrews',
            givenName: 'Cindy',
            spouses: [{
                familyName: 'Bridger',
                givenName: 'Karl'
            }],
            siblings: [{
                familyName: 'Andrews',
                givenName: 'Beccy'
            }],
            children: [{
                familyName: 'Bridger',
                givenName: 'Travis'
            }, {
                familyName: 'Bridger',
                givenName: 'Ryan'
            }]
        });

        await addPerson({
            familyName: 'Grey',
            givenName: 'Frea',
            spouses: [{
                familyName: 'Bridger',
                givenName: 'Alan'
            }]
        });

        await addPerson({
            familyName: 'Bridger',
            givenName: 'Alan',
            siblings: [{
                familyName: 'Bridger',
                givenName: 'Mick'
            }]
        });

        await addPerson({
            familyName: 'Grey',
            givenName: 'Frea',
            parents: [{
                familyName: 'Grey',
                givenName: 'Florence'
            }, {
                familyName: 'Grey',
                givenName: 'Ralph'
            }]
        });
    }

    // Person + Movie
    if (dataToGen.personAndMovie) {
        const johnMcTiernan = await addPerson({
            familyName: 'McTiernan',
            givenName: 'John'
        });

        await db.create('movies', {
            '@type': 'Movie',
            name: 'Die Hard',
            genre: 'Action',
            directors: [johnMcTiernan._id],
            actors: [],
            // Taken from tvdb
            description: `John McClane, officer of the NYPD, tries to save wife Holly Gennaro and several others, taken hostage by German terrorist Hans Gruber during a Christmas party at the Nakatomi Plaza in Los Angeles.`
        });
    }

    // Person + Show + Episode
    if (dataToGen.personShowAndEpisode) {
        const danCastellaneta = await addPerson({
            familyName: 'Castellaneta',
            givenName: 'Dan'
        });

        const theSimpsons = await db.create('shows', {
            '@type': 'Show',
            name: 'The Simpsons',
            genre: 'Comedy (Animation)',
            directors: [],
            actors: [danCastellaneta._id],
            // Taken from tvdb
            description: `Set in Springfield, the average American town, the show focuses on the antics and everyday adventures of the Simpson family; Homer, Marge, Bart, Lisa and Maggie, as well as a virtual cast of thousands. Since the beginning, the series has been a pop culture icon, attracting hundreds of celebrities to guest star. The show has also made name for itself in its fearless satirical take on politics, media and American life in general.`
        });

        const seasonOne = await db.create('creative-work-seasons', {
            '@type': 'CreativeWorkSeason',
            seasonNumber: 1,
            partOfShow: theSimpsons._id
        });

        const episodeOne = await db.create('episodes', {
            '@type': 'Episode',
            name: 'Simpsons Roasting on an Open Fire',
            episodeNumber: 1,
            partOfShow: theSimpsons._id,
            partOfSeason: seasonOne._id,
            // Taken from tvdb
            description: `When his Christmas bonus is cancelled, Homer becomes a department-store Santa--and then bets his meager earnings at the track. When all seems lost, Homer and Bart save Christmas by adopting the losing greyhound, Santa's Little Helper.`
        });

        // Add episodeOne to the season
        await db.update('creative-work-seasons', seasonOne._id, {
            episodes: [episodeOne._id]
        });

        // Add seasonOne and epsiodeOne to the show
        await db.update('shows', theSimpsons._id, {
            episodes: [episodeOne._id],
            seasons: [seasonOne._id]
        });
    }

    // VideoGame
    if (dataToGen.videoGame) {
        const xboxOne = await db.create('consoles', {
            '@type': 'VideoGameConsole',
            name: 'Xbox One',
            releaseDate: new Date('November 22, 2013')
        });

        const farCry4 = await db.create('games', {
            '@type': 'VideoGame',
            name: 'Far Cry 4',
            playMode: ['CoOp', 'MultiPlayer', 'SinglePlayer'],
            numberOfPlayers: {
                minValue: 1,
                maxValue: 2
            },
            gamePlatform: [xboxOne._id]
        });
    }

    // TVDB *rage scene exceptions
    {
        if (!process.env.TVDB_KEY) {
            log.debug('Skipping loading from tvdb as `process.env.TVDB_KEY` is empty');
            return;
        }

        const tvdb = new TVDB(process.env.TVDB_KEY);
        let exceptions = {};

        try {
            const file = fs.readFileSync('../scene_exceptions_tvdb.json', 'utf8');
            exceptions = JSON.parse(file).tvdb;
        } catch (error){
            log.error(error.message);
        }

        // @ts-ignore
        await forEach(Object.entries(exceptions), async ([id, exceptions]) => {
            log.info(`${id}: START`)
            const show = await tvdb.getSeriesById(id)
                .then(response => {
                    log.info(`${id}: DONE!`);
                    return response;
                })
                .catch(error => {
                    log.info(`${id}: ERROR \nMesssage: ${error.message}`)
                });

            await db.create('shows', {
                '@type': 'Show',
                name: show.seriesName,
                genres: show.genre,
                description: show.overview
            });
        });
    }

    log.debug('Mock data added to the db!');
    log.close();
};

module.exports = genMockData;
