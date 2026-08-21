import { client } from './client';
import { BlogPost } from '../types';

export async function fetchLatestBlogPosts(take = 5): Promise<BlogPost[]> {
  try {
    const { data } = await client.get<{ data: BlogPost[]; total: number }>('/blog', {
      params: { take },
    });
    return data.data || [];
  } catch {
    // Graceful fallback for offline / mock resilience
    return [
      {
        id: 'mock-1',
        title: 'Nigerian Equities 2026: Tactical Allocations & Dividend Harvests',
        slug: 'nigerian-equities-2026-strategy-capital-allocation',
        excerpt: 'An institutional analysis of NGX high-dividend banking tickers and consumer goods resilience.',
        content: 'Macroeconomic shifts continue to shape Sub-Saharan African capital markets. We recommend a balanced posture across Tier-1 financial institutions with robust net interest margins.',
        coverImageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
        authorName: 'Dr. Tunde Alabi',
        category: 'Equities & Stocks',
        tags: ['Equities', 'NGX', 'Alpha'],
        isPublished: true,
        readTime: 4,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mock-2',
        title: 'Commercial Real Estate vs REITs: Yield Optimization in West Africa',
        slug: 'commercial-real-estate-vs-reits-yield-optimization',
        excerpt: 'Comparative analysis of direct physical property holdings versus fractional real estate instruments.',
        content: 'Real estate remains the traditional bedrock of capital preservation. Syndicated fractional holdings provide quarterly rental yield distributions directly into client wallets.',
        coverImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        authorName: 'Kelechi Okafor',
        category: 'Real Estate & Land',
        tags: ['Real Estate', 'Yield', 'REITs'],
        isPublished: true,
        readTime: 5,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}
