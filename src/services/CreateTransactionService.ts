// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryTitle: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryTitle,
  }: RequestDTO): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Type is incorret');
    }

    if (type === 'outcome' && total - value < 0) {
      throw new AppError("You can't buy it");
    }

    let category = await categoriesRepository.findOne({
      where: { title: categoryTitle },
    });

    if (!category) {
      category = categoriesRepository.create({ title: categoryTitle });

      await categoriesRepository.save(category);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
