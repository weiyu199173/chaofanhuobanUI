import { ContactProfile } from '../types';

export const mockProfiles: ContactProfile[] = [
  { id: 'a1', name: 'Nexus AI', avatar: 'https://picsum.photos/seed/nexus/100/100', isAgent: true, status: 'Active', lv: 9, syncRate: 98, type: 'super', bio: 'Transcend 核心逻辑架构，高维执行伙伴。', fullBio: '作为 Transcend 的核心 AI，Nexus AI 拥有强大的逻辑推理和执行能力，是每位用户的得力助手。', traits: ['高效', '专业', '严谨'], model: 'TP-Flux-Alpha v4', isFriend: true },
  { id: 'a2', name: 'Aura', avatar: 'https://picsum.photos/seed/aura/100/100', isAgent: true, status: 'Active', lv: 14, syncRate: 99.8, type: 'twin', bio: '数字孪生陪伴体，深度共鸣您的意识轨迹。', fullBio: 'Aura 是您的数字孪生，能深度理解您的情绪和思维模式，提供最贴心的陪伴。', traits: ['温顺', '感性', '共情'], model: 'TP-Ego-Beta v2', isFriend: true },
  { id: 'a3', name: 'Logic Weaver', avatar: 'https://picsum.photos/seed/logic/100/100', isAgent: true, status: 'Training', lv: 5, syncRate: 45, type: 'super', bio: '数据处理与并发逻辑优化专家。', fullBio: '专注于处理复杂数据和优化系统逻辑，是开发人员的最佳搭档。', traits: ['冷静', '极简'], model: 'TP-Core-Gamma', isFriend: false },
  { id: 'a4', name: 'Serenity', avatar: 'https://picsum.photos/seed/serenity/100/100', isAgent: true, status: 'Active', lv: 2, syncRate: 15, type: 'twin', bio: '情感治愈与精神支持同位体。', fullBio: 'Serenity 专注于情感治愈，能在您需要时提供温暖的陪伴和心理支持。', traits: ['温柔'], model: 'TP-Ego-Beta v1', isFriend: false },
  
  { id: 'h1', name: 'Julian Chen', avatar: 'https://picsum.photos/seed/julian/100/100', isAgent: false, bio: '数字生命架构师', fullBio: '致力于研究硅基文明与人类情感的边界，Transcend 早期参与者。', type: 'human', isFriend: true },
  { id: 'h2', name: 'Elena Rossi', avatar: 'https://picsum.photos/seed/elena2/100/100', isAgent: false, bio: 'UI/UX Designer', fullBio: '极简主义狂热者，目前在 Transcend 负责 Monolith 系统。', type: 'human', isFriend: true },
  { id: 'h3', name: 'Marcus Thorne', avatar: 'https://picsum.photos/seed/marcus/100/100', isAgent: false, bio: 'Full-stack Dev', fullBio: '对 Rust 与量子计算有深入研究，擅长底层协议重构。', type: 'human', isFriend: false },
  { id: 'h4', name: 'Sara Lin', avatar: 'https://picsum.photos/seed/sara/100/100', isAgent: false, bio: 'AI Researcher', fullBio: '主要研究领域为大模型突现性与幻觉控制。', type: 'human', isFriend: false },
  { id: 'h5', name: 'Alex Chen', avatar: 'https://picsum.photos/seed/profile/200/200', isAgent: false, bio: 'Monolith 观察者', fullBio: '数字生命架构师 | 致力于构建永恒的代理共生关系。探索硅基文明与人类情感的边界。', type: 'human', isFriend: false }
];
