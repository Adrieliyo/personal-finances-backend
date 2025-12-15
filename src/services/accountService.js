import { AccountModel } from "../models/accountModel.js";

export const AccountService = {
  async createAccount(userId, accountData) {
    const newAccount = {
      user_id: userId,
      name: accountData.name,
      account_type_id: accountData.account_type_id || 1,
      current_balance: accountData.current_balance || 0,
    };

    return await AccountModel.create(newAccount);
  },

  async getUserAccounts(userId) {
    const accounts = await AccountModel.findByUserId(userId);

    if (!accounts || accounts.length === 0) {
      return [];
    }

    return accounts;
  },

  async getAccountById(id) {
    const account = await AccountModel.findById(id);
    if (!account) {
      throw new Error("Account not found");
    }
    return account;
  },

  async updateAccount(id, accountData) {
    return await AccountModel.update(id, accountData);
  },

  async deleteAccount(id) {
    return await AccountModel.delete(id);
  },

  async updateBalance(id, newBalance) {
    return await AccountModel.updateBalance(id, newBalance);
  },

  async getTotalBalance(userId) {
    const accounts = await AccountModel.findByUserId(userId);

    const totals = {
      total: 0,
      bank: 0,
      cash: 0,
      credit: 0,
      investment: 0,
    };

    accounts.forEach((account) => {
      const balance = parseFloat(account.current_balance) || 0;
      totals.total += balance;

      if (account.account_types.is_credit) {
        totals.credit += balance;
      } else if (account.account_types.is_investment) {
        totals.investment += balance;
      } else if (account.account_types.name === "Banco") {
        totals.bank += balance;
      } else if (account.account_types.name === "Efectivo") {
        totals.cash += balance;
      }
    });

    return totals;
  },
};
