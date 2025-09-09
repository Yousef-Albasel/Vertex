---
title: "AVL Tree structure"
description: "A AVL Tree algorithm implementation"
date: "2024-02-20"
category: "Algorithms"
image: "/images/algorithms.png"

---

```c
#include <iostream>
#include <queue>
#include <algorithm>

class AVLTreeNode {
public:
    int key;
    AVLTreeNode* left;
    AVLTreeNode* right;
    int height;

    AVLTreeNode(int key) : key(key), left(nullptr), right(nullptr), height(1) {}
};

class AVLTree {
private:
    AVLTreeNode* root;

public:
    AVLTree() : root(nullptr) {}

    AVLTreeNode* insert(AVLTreeNode* node, const int& key);
    AVLTreeNode* remove(AVLTreeNode* node, const int& key);
    int getHeight(AVLTreeNode* node);
    int getBalanceFactor(AVLTreeNode* node);
    AVLTreeNode* rotateRight(AVLTreeNode* node);
    AVLTreeNode* rotateLeft(AVLTreeNode* node);
    void visit(AVLTreeNode* node);
    void breadthFirstSearch();
    void DFSInOrder(AVLTreeNode* node);
    void DFSPreOrder(AVLTreeNode* node);
    void DFSPostOrder(AVLTreeNode* node);
    void depthFirstSearch();
    AVLTreeNode* findNode(AVLTreeNode* node, const int& key);
    AVLTreeNode* findMinNode(AVLTreeNode* node);
};

int AVLTree::getHeight(AVLTreeNode* node) {
    if (node == nullptr) return 0;
    return node->height;
}

int AVLTree::getBalanceFactor(AVLTreeNode* node) {
    if (node == nullptr) return 0;
    return getHeight(node->left) - getHeight(node->right);
}

AVLTreeNode* AVLTree::rotateRight(AVLTreeNode* y) {
    AVLTreeNode* x = y->left;
    AVLTreeNode* T2 = x->right;

    x->right = y;
    y->left = T2;

    y->height = 1 + std::max(getHeight(y->left), getHeight(y->right));
    x->height = 1 + std::max(getHeight(x->left), getHeight(x->right));

    return x;
}

AVLTreeNode* AVLTree::rotateLeft(AVLTreeNode* x) {
    AVLTreeNode* y = x->right;
    AVLTreeNode* T2 = y->left;

    y->left = x;
    x->right = T2;

    x->height = 1 + std::max(getHeight(x->left), getHeight(x->right));
    y->height = 1 + std::max(getHeight(y->left), getHeight(y->right));

    return y;
}

AVLTreeNode* AVLTree::insert(AVLTreeNode* node, const int& key) {
    if (node == nullptr) return new AVLTreeNode(key);

    if (key < node->key) {
        node->left = insert(node->left, key);
    } else if (key > node->key) {
        node->right = insert(node->right, key);
    } else {
        return node; // Duplicate keys are not allowed
    }

    node->height = 1 + std::max(getHeight(node->left), getHeight(node->right));

    int balance = getBalanceFactor(node);

    // Left Left Case
    if (balance > 1 && key < node->left->key)
        return rotateRight(node);

    // Right Right Case
    if (balance < -1 && key > node->right->key)
        return rotateLeft(node);

    // Left Right Case
    if (balance > 1 && key > node->left->key) {
        node->left = rotateLeft(node->left);
        return rotateRight(node);
    }

    // Right Left Case
    if (balance < -1 && key < node->right->key) {
        node->right = rotateRight(node->right);
        return rotateLeft(node);
    }

    return node;
}

AVLTreeNode* AVLTree::remove(AVLTreeNode* node, const int& key) {
    if (node == nullptr) return node;

    if (key < node->key) {
        node->left = remove(node->left, key);
    } else if (key > node->key) {
        node->right = remove(node->right, key);
    } else {
        if (node->left == nullptr || node->right == nullptr) {
            AVLTreeNode* temp = node->left ? node->left : node->right;
            if (temp == nullptr) {
                temp = node;
                node = nullptr;
            } else {
                *node = *temp; // Copy the contents of temp to node
            }
            delete temp;
        } else {
            AVLTreeNode* temp = findMinNode(node->right);
            node->key = temp->key;
            node->right = remove(node->right, temp->key);
        }
    }

    if (node == nullptr) return node;

    node->height = 1 + std::max(getHeight(node->left), getHeight(node->right));

    int balance = getBalanceFactor(node);

    // Left Left Case
    if (balance > 1 && getBalanceFactor(node->left) >= 0)
        return rotateRight(node);

    // Left Right Case
    if (balance > 1 && getBalanceFactor(node->left) < 0) {
        node->left = rotateLeft(node->left);
        return rotateRight(node);
    }

    // Right Right Case
    if (balance < -1 && getBalanceFactor(node->right) <= 0)
        return rotateLeft(node);

    // Right Left Case
    if (balance < -1 && getBalanceFactor(node->right) > 0) {
        node->right = rotateRight(node->right);
        return rotateLeft(node);
    }

    return node;
}

AVLTreeNode* AVLTree::findMinNode(AVLTreeNode* node) {
    if (node == nullptr) return nullptr;
    while (node->left != nullptr) {
        node = node->left;
    }
    return node;
}

// Other member functions remain the same

int main() {
    AVLTree avl;

    // Test AVL tree operations
    avl.insert(avl.root, 10);
    avl.insert(avl.root, 20);
    avl.insert(avl.root, 30);
    avl.insert(avl.root, 40);
    avl.insert(avl.root, 50);

    std::cout << "Inorder traversal of AVL tree after insertions:\n";
    avl.DFSInOrder(avl.root);
    std::cout << std::endl;

    avl.remove(avl.root, 30);

    std::cout << "Inorder traversal of AVL tree after removal of 

```
