import { Controller, Get, Param, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const seedArticles = [
  {
    id: 'cycle-basics',
    title: '开缸硝化系统基础',
    category: '新手',
    summary: '理解氨氮、亚硝酸盐和硝酸盐的转化关系。',
    content: '稳定的硝化系统可以把鱼只排泄物产生的氨氮逐步转化为毒性更低的硝酸盐。新缸建议少量投喂并密切检测水质。',
  },
  {
    id: 'water-change',
    title: '换水频率怎么定',
    category: '维护',
    summary: '根据鱼缸密度、水质趋势和过滤能力动态调整。',
    content: '常见社区缸可每周换水 20%-30%。如果硝酸盐持续升高、异味明显或鱼只状态下降，需要提高换水频率。',
  },
];

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query('category') category?: string) {
    const rows = await this.prisma.knowledgeArticle.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return rows.length ? rows : seedArticles;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return (await this.prisma.knowledgeArticle.findUnique({ where: { id } })) ?? seedArticles.find((item) => item.id === id);
  }
}
