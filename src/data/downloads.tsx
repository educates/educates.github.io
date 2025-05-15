import { FaApple, FaLinux } from "react-icons/fa";

export const downloads = [
    {
        label: 'Educates Training Platform for macOS',
        icon: <FaApple size={120} />,
        amd64: {
            arch: 'Intel (amd64)',
            label: 'Intel (amd64)',
            url: 'https://github.com/educates/educates-training-platform/releases/latest/download/educates-darwin-amd64',
        },
        arm64: {
            arch: 'Apple Silicon (arm64)',
            label: 'Apple Silicon (arm64)',
            url: 'https://github.com/educates/educates-training-platform/releases/latest/download/educates-darwin-arm64',
        },
    },
    {
        label: 'Educates Training Platform for Linux',
        icon: <FaLinux size={120} />,
        amd64: {
            arch: 'amd64',
            label: 'amd64',
            url: 'https://github.com/educates/educates-training-platform/releases/latest/download/educates-linux-amd64',
        },
        arm64: {
            arch: 'arm64',
            label: 'arm64',
            url: 'https://github.com/educates/educates-training-platform/releases/latest/download/educates-linux-arm64',
        },
    },
];    