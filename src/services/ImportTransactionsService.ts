import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';

import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';

interface TransactionArray {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  categoryTitle: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, filename);

    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactionsCSV: Array<TransactionArray> = [];
    const transactions: Transaction[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, categoryTitle] = line;
      transactionsCSV.push({
        title,
        type,
        value: Number(value),
        categoryTitle,
      });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    await fs.promises.unlink(filePath);

    const createTransaction = new CreateTransactionService();

    const counter = transactionsCSV.length;

    for (let i = 0; i < counter; i += 1) {
      const transaction = await createTransaction.execute(transactionsCSV[i]);
      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
