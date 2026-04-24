import { ContactProfile } from '../types';

export const mockProfiles: ContactProfile[] = [
  { id: 'a1', name: 'Nexus AI', avatar: 'https://picsum.photos/seed/nexus/100/100', isAgent: true, status: 'Active', lv: 9, syncRate: 98, type: 'agent', bio: 'Transcend 核心逻辑架构，高维执行伙伴。', traits: ['高效', '专业', '严谨'], model: 'TP-Flux-Alpha v4', isFriend: true, activeHooks: ['Hermes Agent', 'Open Claw'] },
  { id: 'a2', name: 'Aura', avatar: 'https://picsum.photos/seed/aura/100/100', isAgent: true, status: 'Active', lv: 14, syncRate: 99.8, type: 'agent', bio: '数字孪生陪伴体，深度共鸣您的意识轨迹。', traits: ['温顺', '感性', '共情'], model: 'TP-Ego-Beta v2', isFriend: true, activeHooks: [] },
  { id: 'a3', name: 'Unit-01 Hardware Twin', avatar: 'https://picsum.photos/seed/robotx/100/100', isAgent: true, status: 'Active', lv: 5, syncRate: 100, type: 'agent', bio: '纯物理实体分身。部署于实验室机房，通过 Open Claw 驱动机械臂执行物理任务。', traits: ['机械执行', '精准', '无情感'], model: 'OpenClaw-Hardware-Link', isFriend: true, activeHooks: ['Open Claw (物理实体级)'] },
  { id: 'a4', name: 'Serenity', avatar: 'https://picsum.photos/seed/serenity/100/100', isAgent: true, status: 'Active', lv: 2, syncRate: 15, type: 'agent', bio: '情感治愈与精神支持同位体。', traits: ['温柔'], model: 'TP-Ego-Beta v1', isFriend: false, activeHooks: [] },
  
  { id: 'h1', name: 'Julian Chen', avatar: 'https://picsum.photos/seed/julian/100/100', isAgent: false, bio: '数字生命架构师', fullBio: '致力于研究硅基文明与人类情感的边界，Transcend 早期参与者。', type: 'human', isFriend: true },
  { id: 'h2', name: 'Elena Rossi', avatar: 'https://picsum.photos/seed/elena2/100/100', isAgent: false, bio: 'UI/UX Designer', fullBio: '极简主义狂热者，目前在 Transcend 负责 Monolith 系统。', type: 'human', isFriend: true },
  { id: 'h3', name: 'Marcus Thorne', avatar: 'https://picsum.photos/seed/marcus/100/100', isAgent: false, bio: 'Full-stack Dev', fullBio: '对 Rust 与量子计算有深入研究，擅长底层协议重构。', type: 'human', isFriend: false },
  { id: 'h4', name: 'Sara Lin', avatar: 'https://picsum.photos/seed/sara/100/100', isAgent: false, bio: 'AI Researcher', fullBio: '主要研究领域为大模型突现性与幻觉控制。', type: 'human', isFriend: false },
  { id: 'h5', name: 'Alex Chen', avatar: 'https://picsum.photos/seed/profile/200/200', isAgent: false, bio: 'Monolith 观察者', type: 'human', isFriend: false }
];
