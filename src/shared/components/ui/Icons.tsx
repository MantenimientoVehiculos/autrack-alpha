// src/shared/components/ui/Icons.tsx
import React from 'react';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

interface IconProps {
    size?: number;
    color?: string;
}

// Feather es una librería de íconos minimalista y limpia

export const HomeIcon = ({ size = 24, color = '#000000' }: IconProps) => (
    <Feather name="home" size={size} color={color} />
);

export const CarIcon = ({ size = 24, color = '#000000' }: IconProps) => (
    <MaterialCommunityIcons name="car" size={size} color={color} />
);

export const BarChartIcon = ({ size = 24, color = '#000000' }: IconProps) => (
    <Feather name="bar-chart-2" size={size} color={color} />
);

export const SettingsIcon = ({ size = 24, color = '#000000' }: IconProps) => (
    <Feather name="settings" size={size} color={color} />
);

export const PlusIcon = ({ size = 24, color = '#000000' }: IconProps) => (
    <Feather name="plus" size={size} color={color} />
);

export const ChevronLeft = ({ size = 24, color = '#000000' }: IconProps) => (
    <Feather name="chevron-left" size={size} color={color} />
);

export const ChevronRight = ({ size = 24, color = '#000000' }: IconProps) => (
    <Feather name="chevron-right" size={size} color={color} />
);

export const TrashIcon = ({ size = 24, color = '#000000' }: IconProps) => (
    <Feather name="trash-2" size={size} color={color} />
);

export const EditIcon = ({ size = 24, color = '#000000' }: IconProps) => (
    <Feather name="edit-2" size={size} color={color} />
);

export const BellIcon = ({ size = 24, color = '#000000' }: IconProps) => (
    <Ionicons name="notifications-outline" size={size} color={color} />
);
