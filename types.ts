import React from 'react';

export interface NavItem {
  icon: React.ReactNode;
  active?: boolean;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  highlight?: boolean;
}

export enum TabOption {
  Users = 'Users',
  GlobalEntry = 'Entry',
  OpsStatus = 'Stay',
  Projects = 'Extend'
}

export enum MegaTab {
  Dashboard = 'Dashboard',
  SourceOfTruth = 'SourceOfTruth',
  Resources = 'Resources'
}