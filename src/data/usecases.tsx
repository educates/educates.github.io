import { IconType } from "react-icons";
import { FaUsers } from "react-icons/fa";
import { FaLaptopCode } from "react-icons/fa";
import { FaRocket } from "react-icons/fa";
import { FaChalkboardTeacher } from "react-icons/fa";

export interface UseCase {
    title: string;
    description: string;
    icon: IconType;
}

export const useCases: UseCase[] = [
    {
        title: 'Interactive Workshops',
        description: 'Host engaging workshops with hands-on exercises and real-time feedback.',
        icon: FaLaptopCode,
    },
    {
        title: 'Team Training',
        description: 'Train your team effectively with customized learning environments.',
        icon: FaUsers,
    },
    {
        title: 'Product Demos',
        description: 'Showcase your products with interactive demonstrations and tutorials.',
        icon: FaRocket,
    },
    {
        title: 'Educational Programs',
        description: 'Create comprehensive educational programs with practical exercises.',
        icon: FaChalkboardTeacher,
    },
];
