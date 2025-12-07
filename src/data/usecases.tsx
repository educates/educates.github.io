import { IconType } from "react-icons";
import { FaUsers, FaRocket } from "react-icons/fa";
import { PiExam } from "react-icons/pi";
import { SiHtmlacademy } from "react-icons/si";

export interface UseCase {
    title: string;
    description: string;
    details: string;
    icon: IconType;
}

export const useCases: UseCase[] = [
    {
        title: 'Team Training',
        description: 'Train your team effectively with customized learning environments.',
        details: 'Train your team or customers with the tools or workflows you use regularly. Embed Educates Training into your own Developer Portal.',
        icon: FaUsers,
    },
    {
        title: 'Product Demos',
        description: 'Showcase your products with interactive demonstrations and tutorials.',
        details: 'Use this at conferences, customer sites, or online training with a set time and audience.',
        icon: FaRocket,
    },
    {
        title: 'Educational Programs',
        description: 'Create comprehensive educational programs with practical exercises.',
        details: 'Create your own Academy type of experience where users can learn about your product and techonlogies embedding Educates Training into your own web site or Learning Management System.',
        icon: SiHtmlacademy,
    },
    {
        title: 'Exams',
        description: 'Exam or certificate people on specific topics.',
        details: 'Create exams or certification tests with hands-on exercises and real-time feedback.',
        icon: PiExam,
    },
];