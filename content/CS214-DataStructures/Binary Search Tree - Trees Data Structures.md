---
title: "Binary Search Trees"
description: "BST algorithm implementation"
date: "2024-02-20"
category: "Algorithms"
image: "/images/algorithms.png"

---

##### Insertion in BST

```c
void BinarySearchTree::insert(const int &key)

{

    if (root == nullptr)

    {

        root = new TreeNode();

        root->key = key;

        m_height = 1;

        return;

    }

  

    TreeNode *current = root;

    TreeNode *parent = nullptr;

  

    // Traverse the tree to find the appropriate position to insert the key

    while (current != nullptr)

    {

        parent = current;

        if (key < current->key)

            current = current->left;

        else if (key > current->key)

            current = current->right;

        else

            return;

    }

  

    // Create a new node and insert it into the tree

    TreeNode *newNode = new TreeNode();

    newNode->key = key;

    newNode->left = nullptr;

    newNode->right = nullptr;

  

    if (key < parent->key)

        parent->left = newNode;

    else

        parent->right = newNode;

  

    m_height = std::max(m_height, getHeight(root));

}
```

##### Finding Height in BST
```c
int BinarySearchTree::getHeight(TreeNode *p)

{

    if (p == nullptr)

        return 0;

    int leftHeight = getHeight(p->left);

    int rightHeight = getHeight(p->right);

    return 1 + std::max(leftHeight, rightHeight);

}

```
##### BFS & DFS

```C

void BinarySearchTree::BreadthFirstSearch()

{

    std::queue<TreeNode *> q;

    TreeNode *p = root;

    if (p != nullptr)

    {

        q.push(p);

        while (!q.empty())

        {

            p = q.front();

            q.pop();

            visit(p);

            if (p->left != nullptr)

            {

                q.push(p->left);

            }

            if (p->right != nullptr)

            {

                q.push(p->right);

            }

        }

    }

}

  

void BinarySearchTree::DFSInOrder(TreeNode *p)

{

    if (p != nullptr)

    {

        DFSInOrder(p->left);

        visit(p);

        DFSInOrder(p->right);

    }

};

  

void BinarySearchTree::DFSPreOrder(TreeNode *p)

{

    if (p != nullptr)

    {

        visit(p);

        DFSPreOrder(p->left);

        DFSPreOrder(p->right);

    }

};

  

void BinarySearchTree::DFSPostOrder(TreeNode *p)

{

    if (p != nullptr)

    {

        DFSPostOrder(p->left);

        DFSPostOrder(p->right);

        visit(p);

    }

};
```

### Removing from BST

```c
TreeNode *BinarySearchTree::remove(TreeNode *root, const int &key)

{

    if (root == nullptr)

        return root;

  

    if (key < root->key)

    {

        root->left = remove(root->left, key);

    }

    else if (key > root->key)

    {

        root->right = remove(root->right, key);

    }

    else

    {

        if (root->left == nullptr)

        {

            TreeNode *temp = root->right;

            delete root;

            return temp;

        }

        else if (root->right == nullptr)

        {

            TreeNode *temp = root->left;

            delete root;

            return temp;

        }

  

        TreeNode *temp = FindSuccessor(root->right);

        root->key = temp->key;

        root->right = remove(root->right, temp->key);

    }

    return root;

}

  

TreeNode *BinarySearchTree::FindSuccessor(TreeNode *root)

{

    while (root && root->left != nullptr)

        root = root->left;

    return root;

}
```
