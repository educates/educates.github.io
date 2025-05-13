export interface TeamMember {
    name: string;
    role: string;
    image: string;
    github?: string;
    twitter?: string;
    linkedin?: string;
}

export const teamMembers: TeamMember[] = [
    {
        name: 'Graham Dumpleton',
        role: 'Project co-Lead',
        image: 'https://avatars.githubusercontent.com/u/507637?v=4',
        github: 'https://github.com/GrahamDumpleton',
        // twitter: 'https://twitter.com/GrahamDumpleton',
        linkedin: 'https://linkedin.com/in/GrahamDumpleton',
    },
    {
        name: 'Jorge Morales',
        role: 'Project co-Lead',
        image: 'https://avatars.githubusercontent.com/u/78350?v=4',
        github: 'https://github.com/jorgemoralespou',
        // twitter: 'https://twitter.com/jorgemoralespou',
        linkedin: 'https://linkedin.com/in/jorgemoralespou',
    },
    {
        name: 'Bill Kable',
        role: 'Project contributor',
        image: 'https://avatars.githubusercontent.com/u/830281?v=4',
        github: 'https://github.com/billkable',
        // twitter: 'https://twitter.com/billkable',
        linkedin: 'https://linkedin.com/in/billkable',
    },    
];