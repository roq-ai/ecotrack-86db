import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'server/db';
import { errorHandlerMiddleware } from 'server/middlewares';
import { sustainabilityGoalValidationSchema } from 'validationSchema/sustainability-goals';
import { HttpMethod, convertMethodToOperation, convertQueryToPrismaUtil } from 'server/utils';
import { getServerSession } from '@roq/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId, user } = await getServerSession(req);
  await prisma.sustainability_goal
    .withAuthorization({
      roqUserId,
      tenantId: user.tenantId,
      roles: user.roles,
    })
    .hasAccess(req.query.id as string, convertMethodToOperation(req.method as HttpMethod));

  switch (req.method) {
    case 'GET':
      return getSustainabilityGoalById();
    case 'PUT':
      return updateSustainabilityGoalById();
    case 'DELETE':
      return deleteSustainabilityGoalById();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getSustainabilityGoalById() {
    const data = await prisma.sustainability_goal.findFirst(convertQueryToPrismaUtil(req.query, 'sustainability_goal'));
    return res.status(200).json(data);
  }

  async function updateSustainabilityGoalById() {
    await sustainabilityGoalValidationSchema.validate(req.body);
    const data = await prisma.sustainability_goal.update({
      where: { id: req.query.id as string },
      data: {
        ...req.body,
      },
    });
    return res.status(200).json(data);
  }
  async function deleteSustainabilityGoalById() {
    const data = await prisma.sustainability_goal.delete({
      where: { id: req.query.id as string },
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(handler)(req, res);
}
