const fs = require('fs');
const chalk = require('chalk').default;
const TVDB = require('node-tvdb');
const AppError = require('../errors/app-error');
const countries = require('./countries');

const log = {
    debug: console.debug,
    info: console.info,
    error: console.error
};

const genMockData = db => {
    if (!db) {
        throw new AppError('Missing db param!');
    }

    if (process.env.CLEAR_DB) {
        log.debug('Clearing db...');
        db.clear();
    }

    if (!process.env.NODE_ENV) {
        return;
    }

    const dataToGen = {
        personAndMovie: false,
        personShowAndEpisode: false,
        addPerson: true,
        videoGame: false,
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
     * @param {string} database Database to use.
     * @param {object} searchCriteria e.g. `{ id: 'eee2051f-bd0a-4dfe-bbdd-3578a57ef1bc' }`
     * @param {object} [updateData = {}] e.g. `{ additionalName: 'John' }`
     */
    const findOrCreate = (database, searchCriteria, updateData = {}) => {
        // Find things based on searchCriteria
        const foundThings = db.find(database, {
            ...searchCriteria
        });

        if (foundThings.length > 1) {
            log.debug(searchCriteria, foundThings);
            throw new AppError('Found multiple things for that query!');
        }

        const foundThing = foundThings[0];

        // If we found an existing one return ID.
        if (foundThing) {
            log.debug(`Returning ${chalk.green('EXISTING')} ${foundThing.id} from ${database}`);
            return foundThing;
        }

        // Create a new thing
        const newThing = db.save(database, {
            ...searchCriteria,
            ...updateData
        });

        log.debug(`Returning ${chalk.yellow('NEW')} ${newThing.id} from ${database}`);
        return newThing;
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
    const addPerson = ({
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
        log.debug();
        log.debug('------------------------------------------------');
        const haveParents = parents.length >= 1;
        const haveChildren = children.length >= 1;
        log.debug(`Adding user ${givenName} ${familyName}${(haveParents || haveChildren) ? ' with ' : ''}${haveParents ? 'parents' : ''}${(haveParents && haveChildren) ? ' and ' : ''}${haveChildren ? 'children' : ''}`);

        const findOrCreateAndReturnId = (people, type) => people.map(person => {
            log.debug(`Adding ${type} ${typeof person === 'string' ? person : (person.givenName + ' ' + person.familyName)}`);
            return findOrCreate('people', {
                '@type': 'Person',
                ...person
            }).id;
        });

        const updateRelationship = (person, people, field, relationship) => {
            people.forEach(id => {
                const other = db.findOne('people', { id });

                log.debug(`Updating ${relationship} ${other.givenName} adding ${person.givenName} as ${field}`);
                db.update('people', other.id, {
                    [field]: [
                        ...(Object.keys(other).includes(field) ? other[field] : []),
                        person.id
                    ]
                });
            });
        };

        // Resolve all objects to ID strings
        parents = findOrCreateAndReturnId(parents, 'parent');
        children = findOrCreateAndReturnId(children, 'child');
        spouses = findOrCreateAndReturnId(spouses, 'spouse');
        siblings = findOrCreateAndReturnId(siblings, 'sibling');

        // Resolve object to ID string
        if (nationality) {
            nationality = findOrCreate('countries', {
                '@type': 'Country',
                name: typeof nationality === 'string' ? nationality : (nationality && nationality.name)
            }).id;
        }

        // Search for person via familyName, additionalName and givenName.
        // When found update rest of details.
        const person = findOrCreate('people', {
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
        updateRelationship(person, parents, 'children', 'parent');
        updateRelationship(person, children, 'parents', 'child');
        updateRelationship(person, spouses, 'spouses', 'spouse');
        updateRelationship(person, siblings, 'siblings', 'sibling');

        log.debug('------------------------------------------------');
        log.debug();

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

        occupations.forEach(occupation => {
            findOrCreate('occupations', {
                '@type': 'Occupation',
                name: occupation.name
            }, {
                ...occupation
            });
        });
    }

    // Countries
    if (dataToGen.addCountry) {
        countries.forEach(country => {
            findOrCreate('countries', {
                '@type': 'Country',
                name: country.name
            }, {
                ...country
            });
        });
    }

    // People
    if (dataToGen.addPerson) {
        addPerson({
            familyName: 'Tyler',
            givenName: 'Alexis',
            gender: 'Female',
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

        addPerson({
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

        addPerson({
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

        addPerson({
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

        addPerson({
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

        addPerson({
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
        })

        addPerson({
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

        addPerson({
            familyName: 'Sporn',
            givenName: 'Melony',
            children: [{
                familyName: 'Sporn',
                givenName: 'Taylah'
            }]
        });

        addPerson({
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

        addPerson({
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

        addPerson({
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

        addPerson({
            familyName: 'Grey',
            givenName: 'Frea',
            spouses: [{
                familyName: 'Bridger',
                givenName: 'Alan'
            }]
        });

        addPerson({
            familyName: 'Bridger',
            givenName: 'Alan',
            siblings: [{
                familyName: 'Bridger',
                givenName: 'Mick'
            }]
        });

        addPerson({
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
        const johnMcTiernan = addPerson({
            familyName: 'McTiernan',
            givenName: 'John'
        });

        db.save('movies', {
            '@type': 'Movie',
            name: 'Die Hard',
            genre: 'Action',
            directors: [johnMcTiernan.id],
            actors: [],
            // Taken from tvdb
            description: `John McClane, officer of the NYPD, tries to save wife Holly Gennaro and several others, taken hostage by German terrorist Hans Gruber during a Christmas party at the Nakatomi Plaza in Los Angeles.`
        });
    }

    // Person + Show + Episode
    if (dataToGen.personShowAndEpisode) {
        const danCastellaneta = addPerson({
            familyName: 'Castellaneta',
            givenName: 'Dan'
        });

        const theSimpsons = db.save('shows', {
            '@type': 'Show',
            name: 'The Simpsons',
            genre: 'Comedy (Animation)',
            directors: [],
            actors: [danCastellaneta.id],
            // Taken from tvdb
            description: `Set in Springfield, the average American town, the show focuses on the antics and everyday adventures of the Simpson family; Homer, Marge, Bart, Lisa and Maggie, as well as a virtual cast of thousands. Since the beginning, the series has been a pop culture icon, attracting hundreds of celebrities to guest star. The show has also made name for itself in its fearless satirical take on politics, media and American life in general.`
        });

        const seasonOne = db.save('seasons', {
            '@type': 'Season',
            seasonNumber: 1,
            partOfShow: theSimpsons.id
        });

        const episodeOne = db.save('episodes', {
            '@type': 'Episode',
            name: 'Simpsons Roasting on an Open Fire',
            episodeNumber: 1,
            partOfShow: theSimpsons.id,
            partOfSeason: seasonOne.id,
            // Taken from tvdb
            description: `When his Christmas bonus is cancelled, Homer becomes a department-store Santa--and then bets his meager earnings at the track. When all seems lost, Homer and Bart save Christmas by adopting the losing greyhound, Santa's Little Helper.`
        });

        // Add episodeOne to the season
        db.update('seasons', seasonOne.id, {
            episodes: [episodeOne.id]
        });

        // Add seasonOne and epsiodeOne to the show
        db.update('shows', theSimpsons.id, {
            episodes: [episodeOne.id],
            seasons: [seasonOne.id]
        });
    }

    // VideoGame
    if (dataToGen.videoGame) {
        const xboxOne = db.save('consoles', {
            '@type': 'VideoGameConsole',
            name: 'Xbox One',
            releaseDate: new Date('November 22, 2013')
        });

        const farCry4 = db.save('games', {
            '@type': 'VideoGame',
            name: 'Far Cry 4',
            playMode: ['CoOp', 'MultiPlayer', 'SinglePlayer'],
            numberOfPlayers: {
                minValue: 1,
                maxValue: 2
            },
            gamePlatform: [xboxOne.id]
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
            log.error(error);
        }

        // @ts-ignore
        Object.entries(exceptions).forEach(async ([id, exceptions]) => {
            log.info(`${id}: START`)
            const show = await tvdb.getSeriesById(id)
                .then(response => {
                    log.info(`${id}: DONE!`);
                    return response;
                })
                .catch(error => {
                    log.info(`${id}: ERROR \nMesssage: ${error.message}`)
                });

            db.save('shows', {
                '@type': 'Show',
                name: show.seriesName,
                genres: show.genre,
                description: show.overview
            });
        });
    }

    log.debug('Mock data added to the db!');
};

module.exports = genMockData;