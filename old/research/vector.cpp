// vector::operator[]
#include <iostream>
#include <vector>

int main ()
{
  std::vector<int> myvector (10);   // 10 zero-initialized elements

  for (unsigned i=0; i<10; i++) myvector[i]=i;

  std::cout << "myvector contains:";
  for (unsigned i=0; i<10; i++)
    std::cout << ' ' << myvector[i];
  std::cout << '\n';

  return 0;
}
