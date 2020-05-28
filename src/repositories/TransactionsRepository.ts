import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    const transactions = await this.find();

    transactions.forEach((transaction: Transaction) => {
      const { type, value } = transaction;

      balance[type] += value;

      balance.total += type === 'income' ? value : -value;
    });

    return balance;
  }
}

export default TransactionsRepository;
